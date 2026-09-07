import { forwardRef, useImperativeHandle } from "react";
import type { StepHandle } from "./StepHandle";

const ComingSoonStep = forwardRef<StepHandle, { title: string }>(function ComingSoonStep(
  { title },
  ref,
) {
  useImperativeHandle(ref, () => ({ validate: () => true }));

  return (
    <div>
      <h1 className="text-[24px] font-semibold">{title}</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        This step arrives in a later phase of the build. For now, use Back to return to step 1.
      </p>
    </div>
  );
});

export default ComingSoonStep;
