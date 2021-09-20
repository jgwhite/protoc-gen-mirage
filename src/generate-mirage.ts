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
      const file = new CodeGeneratorResponse.File();
      const filename = messageType.getName().toLowerCase();

      file.setName(`mirage/models/${filename}.ts`);

      response.addFile(file);
    }
  }

  return response;
}
