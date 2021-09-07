import { builders as b } from "ast-types";
import { readFileSync } from "fs";
import { print } from "recast";

import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";

const stdin = readFileSync(0);
const request = CodeGeneratorRequest.deserializeBinary(stdin);

const response = new CodeGeneratorResponse();

const file = new CodeGeneratorResponse.File();

const ast = b.program([
  b.variableDeclaration("let", [
    b.variableDeclarator(
      {
        ...b.identifier("name"),
        typeAnnotation: b.tsTypeAnnotation(
          b.tsTypeReference(b.identifier("string"))
        ),
      },
      b.stringLiteral("alice")
    ),
  ]),
]);

file.setName("hello.ts");
file.setContent(print(ast).code);

response.addFile(file);

process.stdout.write(response.serializeBinary());
