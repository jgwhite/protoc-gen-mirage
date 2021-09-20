import { CodeGeneratorRequest, CodeGeneratorResponse } from "./proto/plugin";

export function generateMirage(
  request: CodeGeneratorRequest
): CodeGeneratorResponse {
  const response = new CodeGeneratorResponse();
  const protos = request.getProtoFileList();

  for (const fileToGenerate of request.getFileToGenerateList()) {
    const proto = protos.find((p) => p.getName() === fileToGenerate);
    const messageTypes = proto.getMessageTypeList();

    for (const messageType of messageTypes) {
      const model = new CodeGeneratorResponse.File();
      const factory = new CodeGeneratorResponse.File();
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
    }
  }

  return response;
}
