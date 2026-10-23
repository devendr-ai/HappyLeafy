/**
 * Passes a photo picked in the Add plant sheet to the Identify screen. The photo must be picked in
 * the sheet itself (browsers only open the camera or file picker straight from a tap), and data URIs
 * are too big for route params, so it waits here until Identify takes it.
 */
let pending: string | undefined;

export function handOffPhoto(uri: string) {
  pending = uri;
}

/** The waiting photo, once: it's cleared as it's taken. */
export function takeHandedOffPhoto(): string | undefined {
  const uri = pending;
  pending = undefined;
  return uri;
}
