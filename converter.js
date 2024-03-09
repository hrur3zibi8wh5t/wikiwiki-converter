$(function () {
  $("#copy").on("click", function () {
    const resultTxt = $("#result").val();
    navigator.clipboard.writeText(resultTxt);

    this.innerText = "copied !!";
    setTimeout(() => (this.innerText = "copy"), 1000);
  });

  $("#convert").on("click", function () {
    const convertedTxt = convert2($("#source").val());
    $("#result").val(convertedTxt);
  });
});

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convert2(input) {
  const lines = input.split(/\r\n|\n|\r/);
  return lines
    .map((line) => {
      const sharp = line.match(/^#(\w+)(?:\((.*?)\))?(?:\{(.*)\})?/);
      if (sharp) return convetTag(sharp[0], sharp[1], sharp[2], sharp[3]);
      return convetInline(line);
    })
    .join("\n");
}

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convetInline(line) {
  if (!line) return "";
  return line.replace(
    /&(\w+)(?:\((.*?)\))?(?:\{((?:[^{}]|(?:\{(?:[^{}])*?\}))*)\})?/g,
    convetTag
  );
  //return line.replace(/&(\w+)(?:\((.*?)\))?(?:\{(.*)\})?/g, convetTag);
}

/**
 *
 * @param {string} match
 * @param {string} tag
 * @param {string} paramStr
 * @param {string} content
 * @returns {string}
 */
function convetTag(match, tag, paramStr, content) {
  const args = paramStr ? paramStr.split(",") : [];

  let innerText = "";
  switch (tag) {
    // 中央寄せ
    case "center":
      innerText = convetInline(content);
      return `CENTER:${innerText}`;
    // 右寄せ
    case "right":
      innerText = convetInline(content);
      return `RIGHT:${innerText}`;
    // 強調
    case "bold":
    case "b":
      innerText = convetInline(content);
      return `''${innerText}''`;
    // 斜体
    case "italic":
      innerText = convetInline(content);
      return `'''${innerText}'''`;
    // 打消
    case "del":
    case "s":
    case "strike":
      innerText = convetInline(content);
      return `%%${innerText}%%`;
    // 下線
    case "u":
      innerText = convetInline(content);
      return `%%%${innerText}%%%`;
    // ルビ
    case "ruby":
      innerText = convetInline(content);
      return `&ruby(${paramStr}){${innerText}};`;
    // 文字サイズ
    case "size":
      innerText = convetInline(content);
      return `&size(${paramStr}){${innerText}};`;
    case "sizex":
      innerText = convetInline(content);
      return `&sizex(${paramStr}){${innerText}};`;
    case "big":
      innerText = convetInline(content);
      return `&size(4){${innerText}};`;
    // 注釈
    case "footnote":
      innerText = convetInline(paramStr);
      return `((${innerText}))`;
    // 文字色
    case "color":
      innerText = convetInline(content);
      return `&color(${paramStr}){${innerText}};`;
    // 装飾
    case "font":
      let fontConverted = convetInline(content);

      var fontColorCode = args.find((arg) =>
        arg.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/g)
      );
      if (fontColorCode)
        fontConverted = `&color(${fontColorCode}){${fontConverted}};`;

      if (args.includes("b")) fontConverted = `''${fontConverted}''`;
      if (args.includes("i")) fontConverted = `'''${fontConverted}'''`;
      if (args.includes("l")) fontConverted = `%%${fontConverted}%%`;
      if (args.includes("u")) fontConverted = `%%%${fontConverted}%%%`;
      return fontConverted;
    // 改行
    case "br":
      return `&br;`;
  }

  return match;
}

/**
 *
 * @param {string} input
 * @returns {string}
 */
function convert(input) {
  const result = input
    // 中央寄せ
    .replace(/#center\(\)/g, "&align(center)")
    // 右寄せ
    .replace(/#right\(\)/g, "&align(right)")

    // 折り畳み
    .replace(/#openclose\(show=(.*?)\)/g, "[+]$1")
    .replace(/#region\((.*?)\)/g, "[+]$1")
    .replace(/#region/g, "[+]")
    .replace(/#endregion/g, "[END]");

  return result;
}