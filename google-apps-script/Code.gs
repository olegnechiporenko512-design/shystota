/**
 * Аквакристал — приймач заявок на таблетки для пральних машин.
 *
 * Колонки (15), у цьому порядку:
 * Дата | Ім'я | Телефон | Варіант | Кількість | Сума | Статус LP-CRM |
 * utm_source | utm_medium | utm_campaign | utm_content | fbclid | ttclid | gclid | IP
 *
 * У CRM: product_id з властивостей скрипта, count = quantity,
 * ціна за одиницю = округлене total / quantity.
 * Відповідь CRM пишеться в «Статус LP-CRM».
 *
 * Властивості скрипта:
 *   LP_CRM_URL, LP_CRM_KEY, LP_CRM_PRODUCT_ID, LP_CRM_OFFICE (необов’язково), SHEET_ID (необов’язково)
 * Розгортання: вебзастосунок, виконувати як я, доступ усім.
 * URL /exec → змінна GOOGLE_SCRIPT_URL на Vercel.
 */

var HEADERS = [
  "Дата",
  "Ім'я",
  "Телефон",
  "Варіант",
  "Кількість",
  "Сума",
  "Статус LP-CRM",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "fbclid",
  "ttclid",
  "gclid",
  "IP",
];

function doGet() {
  return jsonOut({ ok: true, success: true, service: "akvakrystal-leads" });
}

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
  } catch (err) {
    return jsonOut({ ok: false, success: false, error: "bad json" });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return jsonOut({ ok: false, success: false, error: "lock" });
  }

  try {
    var leadId = String(data.leadId || "");
    var cache = CacheService.getScriptCache();
    if (leadId && cache.get("lead:" + leadId)) {
      return jsonOut({ ok: true, success: true, duplicate: true });
    }

    var quantity = Number(data.quantity) || 0;
    var total = Number(data.total) || 0;
    var perUnit = Number(data.unitPrice);
    if (!perUnit && quantity) perUnit = Math.round(total / quantity);

    var sheet = getSheet();
    ensureHeaders(sheet);
    var row = [
      Utilities.formatDate(new Date(), "Europe/Kyiv", "yyyy-MM-dd HH:mm:ss"),
      String(data.name || "").slice(0, 80),
      String(data.phone || ""),
      String(data.variant || "").slice(0, 160),
      quantity,
      total,
      "",
      String(data.utm_source || "").slice(0, 200),
      String(data.utm_medium || "").slice(0, 200),
      String(data.utm_campaign || "").slice(0, 200),
      String(data.utm_content || "").slice(0, 200),
      String(data.fbclid || "").slice(0, 300),
      String(data.ttclid || "").slice(0, 300),
      String(data.gclid || "").slice(0, 300),
      String(data.ip || "").slice(0, 64),
    ];
    var rowIndex = sheet.getLastRow() + 1;
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    sheet.getRange(rowIndex, 3).setNumberFormat("@");
    sheet.getRange(rowIndex, 3).setValue(String(data.phone || ""));
    SpreadsheetApp.flush();
    if (leadId) cache.put("lead:" + leadId, "1", 21600);

    var crmPayload = {
      leadId: leadId,
      name: data.name,
      phone: data.phone,
      quantity: quantity,
      variant: data.variant,
      total: total,
      unitPrice: perUnit,
      ip: data.ip,
      userAgent: data.userAgent,
      page: data.page,
      utm_source: data.utm_source,
      utm_medium: data.utm_medium,
      utm_campaign: data.utm_campaign,
      utm_content: data.utm_content,
      utm_term: data.utm_term,
      fbclid: data.fbclid,
      ttclid: data.ttclid,
      gclid: data.gclid,
    };
    var crm = pushCrm(crmPayload);
    sheet.getRange(rowIndex, 7).setValue(crm);
    SpreadsheetApp.flush();
    return jsonOut({ ok: true, success: true, crm: crm });
  } catch (err) {
    return jsonOut({ ok: false, success: false, error: String(err).slice(0, 300) });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("SHEET_ID");
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName("Akvakrystal");
  if (!sheet) sheet = ss.insertSheet("Akvakrystal");
  return sheet;
}

function ensureHeaders(sheet) {
  var first = String(sheet.getRange(1, 1).getValue() || "");
  if (sheet.getLastRow() === 0 || first !== HEADERS[0]) {
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }
  }
  sheet.getRange(1, 3).setNumberFormat("@");
}

function pushCrm(data) {
  var props = PropertiesService.getScriptProperties();
  var base = String(props.getProperty("LP_CRM_URL") || "").replace(/\/+$/, "");
  var key = props.getProperty("LP_CRM_KEY") || "";
  var productId = props.getProperty("LP_CRM_PRODUCT_ID") || "";
  var office = props.getProperty("LP_CRM_OFFICE") || "";
  if (!base || !key || !productId) return "CRM не налаштовано";

  var products = phpList([
    {
      product_id: String(productId),
      price: String(data.unitPrice || ""),
      count: String(data.quantity || ""),
    },
  ]);
  var sender = phpAssoc([
    ["ip", String(data.ip || "")],
    ["user_agent", String(data.userAgent || "")],
    ["page", String(data.page || "")],
  ]);

  var form = {
    key: key,
    order_id: String(data.leadId || new Date().getTime()),
    country: "UA",
    office: office,
    products: products,
    bayer_name: String(data.name || ""),
    phone: String(data.phone || ""),
    comment:
      String(data.variant || "") +
      " | сума " +
      data.total +
      " грн | " +
      data.quantity +
      " шт × " +
      data.unitPrice +
      (data.ttclid ? " | ttclid " + data.ttclid : "") +
      (data.gclid ? " | gclid " + data.gclid : ""),
    payment: "Накладений платіж",
    delivery: "Нова Пошта",
    sender: sender,
    utm_source: String(data.utm_source || ""),
    utm_medium: String(data.utm_medium || ""),
    utm_term: String(data.utm_term || ""),
    utm_content: String(data.utm_content || ""),
    utm_campaign: String(data.utm_campaign || ""),
    additional_1: String(data.fbclid || ""),
    additional_2: String(data.ip || ""),
  };

  try {
    var response = UrlFetchApp.fetch(base + "/api/addNewOrder.html", {
      method: "post",
      payload: form,
      muteHttpExceptions: true,
      followRedirects: true,
    });
    return formatCrm(response.getResponseCode(), response.getContentText() || "");
  } catch (err) {
    return String(err).slice(0, 300);
  }
}

function formatCrm(code, body) {
  var text = String(body || "").slice(0, 300);
  try {
    var parsed = JSON.parse(body);
    var status = String(parsed.status || parsed.result || "").toLowerCase();
    var record = parsed.data;
    if (Object.prototype.toString.call(record) === "[object Array]") record = record[0] || {};
    var id = "";
    if (record && typeof record === "object") id = record.id || record.order_id || "";
    if (!id && parsed.id) id = parsed.id;
    if (status === "ok" || status === "success" || parsed.success === true) {
      return id ? "OK #" + id : "OK";
    }
    var message = parsed.message || parsed.error || text;
    if (Object.prototype.toString.call(message) === "[object Array]") message = message.join(" ");
    message = String(message);
    if (/дубл/i.test(message)) return "OK (дубль)";
    return message.slice(0, 300);
  } catch (err) {
    if (code >= 200 && code < 300 && text) return text.slice(0, 300);
    return "HTTP " + code;
  }
}

function phpString(value) {
  var text = String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  var bytes = Utilities.newBlob(text).getBytes().length;
  return "s:" + bytes + ':"' + text + '";';
}

function phpProduct(item) {
  var body =
    phpString("product_id") +
    phpString(item.product_id) +
    phpString("price") +
    phpString(item.price) +
    phpString("count") +
    phpString(item.count);
  return "a:3:{" + body + "}";
}

function phpList(items) {
  var body = "";
  for (var i = 0; i < items.length; i++) {
    body += "i:" + i + ";" + phpProduct(items[i]);
  }
  return "a:" + items.length + ":{" + body + "}";
}

function phpAssoc(pairs) {
  var body = "";
  for (var i = 0; i < pairs.length; i++) {
    body += phpString(pairs[i][0]) + phpString(pairs[i][1]);
  }
  return "a:" + pairs.length + ":{" + body + "}";
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
