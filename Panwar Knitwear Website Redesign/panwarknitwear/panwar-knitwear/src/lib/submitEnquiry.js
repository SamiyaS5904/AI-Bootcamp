/**
 * Send an enquiry.
 *
 * The client has not supplied a form endpoint yet, so this posts to
 * `VITE_ENQUIRY_ENDPOINT` when one is configured and otherwise resolves
 * locally so the form stays usable. Set the variable in `.env` to go live —
 * see README.md. The WhatsApp path beside the form always works regardless.
 */
export async function submitEnquiry(payload) {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT;

  if (!endpoint) {
    if (import.meta.env.DEV) {
      console.warn(
        "[enquiry] VITE_ENQUIRY_ENDPOINT is not set — the enquiry was not sent anywhere.",
        payload
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { delivered: false };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Enquiry failed with status ${response.status}`);
  }

  return { delivered: true };
}
