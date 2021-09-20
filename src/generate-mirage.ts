import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";

export function generateMirage(
  request: CodeGeneratorRequest
): CodeGeneratorResponse {
  const response = new CodeGeneratorResponse();
  const protos = request.getProtoFileList();

  response.addFile(generateConfig(request));

  for (const fileToGenerate of request.getFileToGenerateList()) {
    const proto = protos.find((p) => p.getName() === fileToGenerate);
    const messageTypes = proto.getMessageTypeList();

    for (const messageType of messageTypes) {
      const model = new CodeGeneratorResponse.File();
      const factory = new CodeGeneratorResponse.File();
      const handler = new CodeGeneratorResponse.File();
      const basename = messageType.getName().toLowerCase();

      model.setName(`mirage/models/${basename}.ts`);
      model.setContent(`import { Model } from 'miragejs';

export default Model.extend({
});
`);

      response.addFile(model);

      factory.setName(`mirage/factories/${basename}.ts`);
      factory.setContent(`import { Factory } from 'miragejs';

export default Factory.extend({

});
`);

      response.addFile(factory);

      handler.setName(`mirage/handlers/${pluralize(basename)}.ts`);
      handler.setContent(`export function list() {}`);

      response.addFile(handler);
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
    const messageTypes = proto.getMessageTypeList();

    for (const messageType of messageTypes) {
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

function capitalize([first, ...rest]: string): string {
  return [first.toUpperCase(), ...rest].join("");
}

function pluralize(word: string): string {
  return word + "s";
}
