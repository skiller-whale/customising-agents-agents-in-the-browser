---
name: flight-recorder
description: Record a browser session as a trail of screenshots. Use whenever you drive the browser with the Playwright tools, so a human can see what you saw.
---
# Flight recorder

Your browser is headless: nobody can watch you use it. So leave a trail of screenshots, each with a one-line note, that a colleague can follow afterwards.

## Starting a run

Pick a run id: today's date and time plus a short slug, like `20260903-1642-transfer-bug`. Use the same id for every step of the task.

## After each meaningful step

A meaningful step is one that changes what a person would see: a page loaded, a form filled in, a button clicked, an error appearing. Not every tool call.

1. Do the thing (navigate, scroll, click, type).
2. `browser_take_screenshot` with `filename: "runs/<run-id>-<NN>-<slug>.png"` - for example `runs/20260903-1642-transfer-bug-03-validation-error.png`. Keep the `runs/` prefix and use no other subdirectory: screenshot paths are relative to the project root, and saving into a folder that does not exist yet fails.
3. Record it:

   ```bash
   node .claude/skills/flight-recorder/scripts/record.ts <run-id> runs/<the-file-you-just-saved>.png "What this step shows"
   ```

Write each note for a colleague following along: "Submitted the transfer form - it failed with a 400", not "took screenshot".

## Finishing

Tell the user where to look:

> Run recorded: http://localhost:3004/<run-id>/

If the report server isn't running, they can start it with `npm run reports`.

## Screenshot files

Screenshots are saved to disk but not sent back to you - the tool reports the path it wrote. To look at one, open that path with the Read tool.
