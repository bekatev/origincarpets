/**
 * Origin Carpets — Gmail mail relay (HTTPS, works on DigitalOcean).
 *
 * Deploy once while logged into noreply.origincarpets@gmail.com:
 * 1. https://script.google.com → New project → paste this file
 * 2. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy the Web app URL into production backend/.env as MAIL_RELAY_URL
 * 4. Set MAIL_RELAY_SECRET to the same value as RELAY_SECRET below
 */
var RELAY_SECRET = 'REPLACE_WITH_MAIL_RELAY_SECRET';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.secret !== RELAY_SECRET) {
      return jsonResponse({ ok: false, error: 'Unauthorized' });
    }

    GmailApp.sendEmail(data.to, data.subject, data.text, {
      htmlBody: data.html,
      name: 'Origin Carpets'
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
