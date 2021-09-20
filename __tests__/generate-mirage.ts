import { CodeGeneratorRequest } from "../src/proto/plugin";

import {
  FileDescriptorProto,
  DescriptorProto,
  FieldDescriptorProto,
} from "google-protobuf/google/protobuf/descriptor_pb";

import { generateMirage } from "../src/generate-mirage";

test("foo", () => {
  const request = new CodeGeneratorRequest();
  const fd = new FileDescriptorProto();
  const messageType = new DescriptorProto();

  messageType.setName("Animal");
  messageType.setFieldList([
    new FieldDescriptorProto().setName("name").setNumber(1),
  ]);

  fd.setName("example.proto");
  fd.setSyntax("proto3");
  fd.setPackage("example");
  fd.setMessageTypeList([messageType]);

  request.setFileToGenerateList(["example.proto"]);
  request.setProtoFileList([fd]);

  const response = generateMirage(request);
  const files = response.getFileList();

  expect(files).toHaveLength(1);
  expect(files[0].getName()).toBe("mirage/models/animal.ts");
  expect(files[0].getContent()).toContain("export default Model.extend({");
});
