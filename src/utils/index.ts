import { message } from "ant-design-vue";

export const Toast = (msg: string, type = "error") => {
  if (document.getElementsByClassName("ant-message-notice").length === 0) {
    message[type](msg);
  }
};
// 坐标点排序
export const sortPoints = (aCoord: any) => {
  let points = JSON.parse(JSON.stringify(aCoord));
  // (tl tr) (bl,br)
  const poiT: canvasPoint = linesIntersection(
    points[0] || points.tl,
    points[1] || points.tr,
    points[2] || points.br,
    points[3] || points.bl
  );
  // (tl br) (tr,bl)
  const poiB: canvasPoint = linesIntersection(
    points[0] || points.tl,
    points[3] || points.bl,
    points[2] || points.br,
    points[1] || points.tr
  );
  if (poiT?.x != -1) {
    // 第二个和第三个坐标互换
    changePoint(points[1] || points.tr, points[2] || points.br);
  } else if (poiB?.x != -1) {
    // 第一个和第四个坐标互换
    changePoint(points[0] || points.tl, points[3] || points.bl);
    // 第二个和第三个坐标互换
    changePoint(points[1] || points.tr, points[2] || points.br);
    // 第一个和第二个坐标互换
    changePoint(points[0] || points.tl, points[1] || points.tr);
  }
  return points;
};
// 坐标点更换
const changePoint = (poi1, poi2) => {
  let temp = { x: poi1.x, y: poi1.y };
  poi1.x = poi2.x;
  poi1.y = poi2.y;

  poi2.x = temp.x;
  poi2.y = temp.y;
};
// 获取线段交点
// 算法参考：https://www.jb51.net/article/90104.htm
function linesIntersection(tl, tr, br, bl) {
  let tn1 = tr.y - tl.y,
    ty1 = tl.x - tr.x;
  let tn2 = br.y - bl.y,
    ty2 = bl.x - br.x;
  let denominator = tn1 * ty2 - ty1 * tn2;
  if (denominator == 0) {
    return { x: -1, y: -1 };
  }
  let distC_N2 = tn2 * bl.x + ty2 * bl.y;
  let distA_N2 = tn2 * tl.x + ty2 * tl.y - distC_N2;
  let distB_N2 = tn2 * tr.x + ty2 * tr.y - distC_N2;

  if (distA_N2 * distB_N2 >= 0) {
    return { x: -1, y: -1 };
  }
  let distA_N1 = tn1 * tl.x + ty1 * tl.y;
  let distC_N1 = tn1 * bl.x + ty1 * bl.y - distA_N1;
  let distD_N1 = tn1 * br.x + ty1 * br.y - distA_N1;
  if (distC_N1 * distD_N1 >= 0) {
    return { x: -1, y: -1 };
  }
  //计算交点坐标
  let fraction = distA_N2 / denominator;
  let dx = fraction * ty1,
    dy = -fraction * tn1;
  return { x: tl.x + dx, y: tl.y + dy };
}
