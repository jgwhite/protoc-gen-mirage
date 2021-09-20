import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";
import { DescriptorProto } from "google-protobuf/google/protobuf/descriptor_pb";

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
  let content = `export default function() {\n`;

  result.setName("mirage/config.ts");

  for (const fileToGenerate of request.getFileToGenerateList()) {
    const proto = protos.find((p) => p.getName() === fileToGenerate);

    for (const messageType of proto.getMessageTypeList()) {
      const basename = messageType.getName().toLowerCase();
      const moduleName = pluralize(basename);
      const endpoint = `/List${pluralize(capitalize(basename))}`;

      content += `  this.post('${endpoint}', ${moduleName}.list);\n`;
    }
  }

  content += "}\n";

  result.setContent(content);

  return result;
}

function generateModel(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();

  result.setName(`mirage/models/${basename}.ts`);
  result.setContent(`import { Model } from 'miragejs';

export default Model.extend({
});
`);

  return result;
}

function generateFactory(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();

  result.setName(`mirage/factories/${basename}.ts`);
  result.setContent(`import { Factory } from 'miragejs';

export default Factory.extend({

});
`);

  return result;
}

function generateHandler(type: DescriptorProto): CodeGeneratorResponse.File {
  const result = new CodeGeneratorResponse.File();
  const basename = type.getName().toLowerCase();

  result.setName(`mirage/handlers/${pluralize(basename)}.ts`);
  result.setContent(`export function list() {}`);

  return result;
}

function capitalize([first, ...rest]: string): string {
  return [first.toUpperCase(), ...rest].join("");
}

function pluralize(word: string): string {
  return word + "s";
}
