import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";
import { DescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";
import { builders as b } from "ast-types";
import { print } from "recast";

export function generateMirage(
  request: CodeGeneratorRequest
): CodeGeneratorResponse {
  const response = new CodeGeneratorResponse();
  const protos = request.getProtoFileList();

  response.addFile(generateConfig(request));

  for (const fileToGenerate of request.getFileToGenerateList()) {
    const proto = protos.find((p) => p.getName() === fileToGenerate);

    for (const messageType of proto.getMessageTypeList()) {
      response.addFile(generateModel(messageType));
      response.addFile(generateFactory(messageType));
      response.addFile(generateHandler(messageType));
    }
  }

  return response;
}

function generateConfig(
  request: CodeGeneratorRequest
): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const protos = request.getProtoFileList();
  const block = b.blockStatement([]);
  const ast = b.program([
    b.exportDefaultDeclaration(
      (() => {
        const result = b.functionDeclaration(null, [], block);
        result.returnType = b.tsTypeAnnotation(b.tsVoidKeyword());
        return result;
      })()
    ),
  ]);

  result.setName("mirage/config.ts");

  for (const fileToGenerate of request.getFileToGenerateList()) {
    const proto = protos.find((p) => p.getName() === fileToGenerate);

    for (const messageType of proto.getMessageTypeList()) {
      const basename = messageType.getName().toLowerCase();
      const moduleName = pluralize(basename);
      const endpoint = `/List${pluralize(capitalize(basename))}`;

      ast.body.unshift(
        b.importDeclaration(
          [b.importNamespaceSpecifier(b.identifier(moduleName))],
          b.stringLiteral(`./handlers/${moduleName}`)
        )
      );

      block.body.push(
        b.expressionStatement(
          b.callExpression(
            b.memberExpression(b.thisExpression(), b.identifier("post")),
            [
              b.stringLiteral(endpoint),
              b.memberExpression(
                b.identifier(moduleName),
                b.identifier("list")
              ),
            ]
          )
        )
      );
    }
  }

  result.setContent(print(ast).code);

  return result;
}

function generateModel(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();
  const ast = b.program([
    b.importDeclaration(
      [b.importSpecifier(b.identifier("Model"))],
      b.stringLiteral("miragejs")
    ),
    b.exportDefaultDeclaration(
      b.callExpression(
        b.memberExpression(b.identifier("Model"), b.identifier("extend")),
        [b.objectExpression([])]
      )
    ),
  ]);

  result.setName(`mirage/models/${basename}.ts`);
  result.setContent(print(ast).code);

  return result;
}

function generateFactory(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();
  const ast = b.program([
    b.importDeclaration(
      [b.importSpecifier(b.identifier("Factory"))],
      b.stringLiteral("miragejs")
    ),
    b.exportDefaultDeclaration(
      b.callExpression(
        b.memberExpression(b.identifier("Factory"), b.identifier("extend")),
        [b.objectExpression([])]
      )
    ),
  ]);

  result.setName(`mirage/factories/${basename}.ts`);
  result.setContent(print(ast).code);

  return result;
}

function generateHandler(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();
  const ast = b.program([
    b.exportNamedDeclaration(
      (() => {
        const r = b.functionDeclaration(
          b.identifier("list"),
          [],
          b.blockStatement([])
        );
        r.returnType = b.tsTypeAnnotation(b.tsVoidKeyword());
        return r;
      })()
    ),
  ]);

  result.setName(`mirage/handlers/${pluralize(basename)}.ts`);
  result.setContent(print(ast).code);

  return result;
}

function capitalize([first, ...rest]: string): string {
  return [first.toUpperCase(), ...rest].join("");
}

function pluralize(word: string): string {
  return word + "s";
}
