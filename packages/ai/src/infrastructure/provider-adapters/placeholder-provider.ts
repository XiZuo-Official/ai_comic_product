import type { AiProviderAdapter } from "../../api";

export const placeholderAiProvider: AiProviderAdapter = {
  providerId: "placeholder",
  async generate(input) {
    return {
      output: {
        outputType: input.type,
        resultRef: null,
        summary: "Placeholder AI result. Real provider integration starts in a later milestone."
      },
      responseMetadata: {
        promptLength: input.prompt.length,
        templateKey: input.promptTemplate.templateKey,
        templateVersion: input.promptTemplate.version
      }
    };
  }
};
