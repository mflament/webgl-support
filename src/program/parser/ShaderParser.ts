import {GLSLType, isGLSLMatrixType, isGLSLScalarType, isGLSLType, isGLSLVectorType} from "./GLSLType";
import {parser as glslParser} from "@shaderfrog/glsl-parser"
import {preprocess} from "@shaderfrog/glsl-parser/preprocessor"

import {
    AttributeDeclaration,
    FunctionDeclaration,
    isPrecisionQualifier,
    LayoutQualifiers,
    ParameterDeclaration,
    ParsedShader,
    Qualifier,
    Quantifier,
    StructDeclaration,
    VariableDeclaration
} from "./ParsedShader";

import {
    AstNode,
    DeclarationStatementNode,
    DeclaratorListNode,
    FullySpecifiedTypeNode,
    FunctionCallNode,
    FunctionHeaderNode,
    FunctionNode,
    FunctionPrototypeNode,
    InterfaceDeclaratorNode,
    ParameterDeclarationNode,
    PrecisionNode,
    StructDeclarationNode,
    StructDeclaratorNode
} from "@shaderfrog/glsl-parser/ast";
import {DeclarationNode, QuantifiedIdentifierNode} from "@shaderfrog/glsl-parser/ast/node";

export function parseShader(source: string, options?: { quiet?: boolean }): ParsedShader {
    const res: ParsedShader = {
        source,
        precisions: [],
        attributes: {in: [], out: []},
        structs: {},
        uniforms: [],
        uniformBlocks: [],
        functions: []
    };

    function checkGLSLType(t: string): GLSLType | undefined {
        if (!isGLSLType(t)) {
            console.warn("Unhanlded GLSL type " + t);
            return undefined;
        }
        return t;
    }

    function visitPrecision(pn: PrecisionNode) {
        const specifier = pn.specifier.specifier;
        if (specifier.type === "keyword") {
            const type = checkGLSLType(specifier.token);
            if (type) {
                const precision = pn.qualifier.token;
                if (isPrecisionQualifier(precision))
                    res.precisions.push({type, precision});
            }
        } else
            console.warn("Unhandled precision node " + JSON.stringify(pn));
    }

    function visitDeclaratorList(dln: DeclaratorListNode) {
        const variables = createVariables(dln, undefined);
        const hasQualifier = (vd: VariableDeclaration, qualifier: string) => vd.qualifiers.indexOf(qualifier) >= 0;
        for (const vd of variables) {
            if (hasQualifier(vd, 'uniform'))
                res.uniforms.push(vd);
            else if (hasQualifier(vd, 'in') && isAttributeDeclaration(vd))
                res.attributes.in.push(vd);
            else if (hasQualifier(vd, 'out') && isAttributeDeclaration(vd))
                res.attributes.out.push(vd);
        }
    }

    function isAttributeDeclaration(vd: VariableDeclaration): vd is AttributeDeclaration {
        return typeof vd.type === "string" && (isGLSLScalarType(vd.type) || isGLSLMatrixType(vd.type) || isGLSLVectorType(vd.type));
    }

    function createVariables(dln: DeclaratorListNode | StructDeclaratorNode, container: string | undefined): VariableDeclaration[] {
        const varType = createVariableType(dln.specified_type);
        if (!varType) return [];
        const createVariable = (decl: DeclarationNode | QuantifiedIdentifierNode): VariableDeclaration | undefined => {
            if (decl?.type === "declaration" || decl?.type === "quantified_identifier") {
                const name = decl.identifier.identifier;
                const quantifier = createDeclaratorQuantifier(dln, decl);
                return {...varType, name, quantifier, container};
            }
            console.warn("Unhandled variable declaration " + JSON.stringify(decl));
            return undefined;
        }
        return dln.declarations.map(createVariable).filter((v): v is VariableDeclaration => !!v);
    }

    function isFullySpecifiedTypeNode(n: AstNode): n is FullySpecifiedTypeNode {
        return n.type === "fully_specified_type";
    }

    function createDeclaratorQuantifier(dln: DeclaratorListNode | StructDeclaratorNode, decl: DeclarationNode | QuantifiedIdentifierNode): Quantifier | undefined {
        // check array decl on type
        let q = isFullySpecifiedTypeNode(dln.specified_type) && parseQuantifierNode(dln.specified_type.specifier.quantifier);
        if (!q) // check array decl on identifier
            q = parseQuantifierNode(decl.quantifier);
        if (q && q.length === undefined) {
            // array decl, but length not declared, try to resolve from initializer
            if (decl.type === "declaration" && isFunctionCall(decl.initializer)) {
                const length = decl.initializer.args?.filter(arg => !isParameterSeperator(arg)).length;
                if (length !== undefined)
                    q = {length}
            } else {
                console.warn("Unable to get array length for " + JSON.stringify(dln));
                return undefined;
            }
        }
        return q as Quantifier;
    }

    function isFunctionCall(decl: AstNode | undefined): decl is FunctionCallNode {
        return decl?.type === "function_call";
    }

    function isParameterSeperator(node: AstNode): boolean {
        return node.type === "literal" && node.literal === ",";
    }

    function parseQuantifierNode(node: AstNode | undefined | null): Partial<Quantifier> | undefined {
        if (!node) return undefined;
        if (node?.type === "array_specifiers") {
            if (node.specifiers[0] && node.specifiers[0].expression)
                return {length: parseInt(node.specifiers[0].expression.token)};
            return {length: undefined};
        }
        if (node) console.warn("Unhandled quantifier " + JSON.stringify(node));
        return undefined;
    }


    function createVariableType(fst: FullySpecifiedTypeNode): Omit<VariableDeclaration, 'name' | 'container' | 'quantifier'> | undefined {
        let type: GLSLType | string | StructDeclaration;
        const specifier = fst.specifier.specifier;
        if (specifier.type === "keyword") {
            const token = specifier.token;
            if (!checkGLSLType(token))
                return undefined;
            type = token;
        } else if (specifier.type === "struct") {
            if (specifier.typeName) {
                type = specifier.typeName.identifier;
                if (!res.structs[type])
                    res.structs[type] = {members: createMembers(specifier.declarations, type)};
                else
                    console.warn("Struct " + type + " already declared : TODO : handle forward declaration");
            } else
                type = {members: createMembers(specifier.declarations, undefined)};
        } else if (specifier.type === "identifier") {
            type = specifier.identifier;
            if (!res.structs[type]) {
                console.warn("Unknown type reference " + type);
                return undefined;
            }
        } else {
            console.warn("Unhandled type specifier " + JSON.stringify(fst));
            return undefined;
        }
        return {
            type,
            qualifiers: createQualifiers(fst.qualifiers)
        };
    }

    function createMembers(declarations: AstNode[], container: string | undefined): VariableDeclaration[] {
        return declarations.filter(isStructDeclaration).flatMap(dln => createVariables(dln.declaration, container));
    }

    function isStructDeclaration(node: AstNode): node is StructDeclarationNode {
        return node.type === "struct_declaration";
    }

    function createQualifier(node: AstNode | undefined | null): Qualifier | undefined {
        if (!node) return undefined;
        if (node.type === 'keyword') return node.token;
        if (node.type === "layout_qualifier") {
            const lq: LayoutQualifiers = {}
            node.qualifiers.forEach(id => lq[id.identifier.identifier] = id.expression ? parseInt(id.expression.token) : undefined);
            return lq;
        }
        console.warn("Invalid qualifier node " + JSON.stringify(node));
        return undefined;
    }

    function createQualifiers(qualifiers: any): Qualifier[] {
        if (!qualifiers) return [];
        if (Array.isArray(qualifiers))
            return qualifiers?.map(createQualifier).filter((q): q is Qualifier => !!q);
        console.warn("Invalid qualifiers " + qualifiers);
        return [];
    }

    function getQuantifier(node: AstNode | undefined, decl: AstNode): Quantifier | undefined {
        const pq = parseQuantifierNode(node);
        if (pq && pq?.length === undefined) {
            console.warn("Unresolved array length" + JSON.stringify(decl));
            return undefined;
        }
        return pq as Quantifier;
    }

    function visitInterfaceDeclarator(interfaceDecl: InterfaceDeclaratorNode) {
        const name = interfaceDecl.interface_type.identifier;
        const quantifier = getQuantifier(interfaceDecl.identifier?.quantifier, interfaceDecl);
        const identifier = interfaceDecl.identifier ? {name, quantifier} : undefined;
        const qualifiers = createQualifiers(interfaceDecl.qualifiers);
        const members = createMembers(interfaceDecl.declarations, name);
        res.uniformBlocks.push({name, qualifiers, members, identifier});
    }

    function visitDeclarationStatement(ds: DeclarationStatementNode) {
        const declaration = ds.declaration;
        if (declaration.type === "precision")
            visitPrecision(declaration);
        else if (declaration.type === "declarator_list")
            visitDeclaratorList(declaration);
        else if (declaration.type === "interface_declarator")
            visitInterfaceDeclarator(declaration);
    }

    function createFunctionReturnType(header: FunctionHeaderNode): FunctionDeclaration['returnType'] | undefined {
        let identifier;
        const specifier = header.returnType.specifier.specifier;
        if (specifier.type === "keyword") identifier = specifier.token;
        else if (specifier.type === "identifier") identifier = specifier.identifier;
        else {
            console.warn("Invalid return type specifier " + JSON.stringify(header.returnType));
            return undefined;
        }
        const quantifier = getQuantifier(header.returnType.specifier.quantifier, header.returnType);
        return {identifier, quantifier};
    }

    function visitFunction(ds: FunctionNode) {
        const prototype = ds.prototype;
        const header = prototype.header;

        const name = header.name.identifier;
        const returnType = createFunctionReturnType(prototype.header);
        const parameters = createFunctionParameters(prototype);
        if (name && returnType && parameters)
            res.functions.push({name, returnType, parameters});
        return undefined;
    }

    function createFunctionParameters(node: FunctionPrototypeNode): ParameterDeclaration[] | undefined {
        const parameters: ParameterDeclarationNode[] = node.parameters || [];
        return parameters.map(createParameter).filter((d): d is ParameterDeclaration => !!d);
    }

    function getParameterType(node: AstNode) {
        if (node.type === "type_specifier") {
            let type;
            if (node.specifier.type === "keyword") type = node.specifier.token;
            else if (node.specifier.type === "identifier") type = node.specifier.identifier;
            if (type)
                return type;
        }
        console.log('Unhandled parameter type node ' + JSON.stringify(node));
        return undefined;
    }

    function createParameter(node: AstNode): ParameterDeclaration | undefined {
        if (node.type === "parameter_declaration") {
            const declaration = node.declaration;
            const qualifiers = createQualifiers(node.qualifier);
            if (declaration.type === "parameter_declarator") {
                const type = getParameterType(declaration.specifier);
                if (type) {
                    const name = declaration.identifier.identifier;
                    const quantifier = declaration.quantifier;
                    return {name, type, qualifiers, quantifier};
                }
            }
        }
        // console.warn("Unhandled parameter node " + JSON.stringify(node));
        return undefined;
    }


    source = preprocess(source, {stopOnError: false});
    const ast = glslParser.parse(source, {quiet: true, ...options});
    ast.program.forEach(node => {
        if (node.type === "declaration_statement") visitDeclarationStatement(node);
        else if (node.type === "function") visitFunction(node);
    });
    return res;
}
