import { GeneratedPayloadSchema } from '../../shared/uiSchema';
import { sampleTree } from './sampleTree';

describe('sampleTree', () => {
  it('satisfies GeneratedPayloadSchema', () => {
    const result = GeneratedPayloadSchema.safeParse(sampleTree);
    expect(result.success).toBe(true);
  });
});
