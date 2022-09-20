<template>
  <div v-show="state.loading" class="loading-box">
    <LoadingOutlined style="font-size: 30px; color: #ea5413" />资源加载中...
  </div>
  <div v-show="!state.loading">
    <canvas id="canvas" :width="cWidth" :height="cHeight"></canvas>
    <div class="draw-btn-group">
      <div class="shape-box">
        <div
          :class="{ active: state.drawType == 'rectangle' }"
          class="shape-border"
          title="画矩形"
          @click="drawTypeChange('rectangle')">
          <i class="draw-icon draw-rect"></i>
        </div>
        <span>长方形</span>
      </div>
      <div class="shape-box">
        <div
          :class="{ active: state.drawType == 'polygon' }"
          class="shape-border shape-border-ti"
          title="画多边形"
          @click="drawPolygon('polygon')">
          <i class="draw-icon draw-rect"></i>
        </div>
        <span>不规则四边形</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { fabric } from "fabric";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { reactive, watch, onMounted } from "vue";
import { sortPoints } from "@/utils";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  area: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 1920,
  },
  height: {
    type: Number,
    default: 1080,
  },
  cWidth: {
    type: Number,
    default: 960,
  },
  cHeight: {
    type: Number,
    default: 540,
  },
});
const state = reactive({
  loading: true,
  radio: 0.5,
  realRadio: 0.5,
  imgPoint: { x: 0, y: 0 },
  realPoint: { x: 0, y: 0 },
  canvas: {} as any,
  mouseFrom: { x: 0, y: 0 } as canvasPoint,
  mouseTo: { x: 0, y: 0 } as canvasPoint,
  drawType: "rectangle" as string, //当前绘制图像的种类
  drawWidth: 2, //笔触宽度
  color: "#E34F51", //画笔颜色
  drawingObject: null as any, //当前绘制对象
  moveCount: 1, //绘制移动计数器
  doDrawing: false as boolean, // 绘制状态
  rectPath: "" as string, //矩形绘制路径
  //polygon 相关参数
  polygonMode: false as boolean,
  pointArray: [] as canvasPoint[],
  lineArray: [] as canvasPoint[],
  activeShape: false as any,
  activeLine: "" as any,
  line: {} as canvasPoint,
});
watch(
  () => state.drawType,
  (value) => {
    state.canvas.selection = !value;
  }
);
watch(
  () => props.width,
  (value) => {
    state.canvas.setWidth(value);
  }
);
watch(
  () => props.height,
  (value) => {
    state.canvas.setHeight(value);
  }
);
const loadInit = () => {
  if (props.src == "") {
    return;
  }
  state.loading = true;
  state.canvas = new fabric.Canvas("canvas", {});
  state.canvas.selectionColor = "rgba(0,0,0,0.05)";
  state.canvas.on("mouse:down", mousedown);
  state.canvas.on("mouse:move", mousemove);
  state.canvas.on("mouse:up", mouseup);
  let imgElement = new Image();
  imgElement.src = props.src;
  imgElement.onload = () => {
    state.radio = props.cWidth / imgElement.width;

    state.realRadio = props.width / imgElement.width;

    state.imgPoint.x = Math.floor(imgElement.width / 2);
    state.imgPoint.y = Math.floor(imgElement.height / 2);

    state.realPoint.x = Math.floor(props.width / 2);
    state.realPoint.y = Math.floor(props.height / 2);
    let imgInstance = new fabric.Image(imgElement, {
      selectable: false,
      width: imgElement.width,
      height: imgElement.height,
      scaleX: state.radio,
      scaleY: state.radio,
    });
    state.canvas.add(imgInstance);
    drawImage();
    state.canvas.renderAll();
    state.loading = false;
  };
};
const drawImage = () => {
  if (props.area === "") {
    clearAll();
    return;
  }
  let points = props.area.split(",").map((item) => {
    let areas = item.split(";");
    return areas.map((ars, index) => {
      let arp = 0;
      let ar = Number(ars);
      if (index % 2 == 0) {
        let dx =
          Math.abs(
            state.realPoint.x > ar
              ? state.realPoint.x - ar
              : state.realPoint.x + ar
          ) / state.realRadio;
        let rdx = Math.abs(state.imgPoint.x - dx);
        arp = rdx;
      } else {
        let dy =
          Math.abs(
            state.realPoint.y > ar
              ? state.realPoint.y - ar
              : state.realPoint.y + ar
          ) / state.realRadio;
        let rdy = Math.abs(state.imgPoint.y - dy);
        arp = rdy;
      }
      return Number(arp) * state.radio;
    });
  });
  points.forEach((point) => {
    drawImageObj(point);
  });
};
const drawImageObj = (data) => {
  let path = "M ";
  let points = [] as any;
  let len = data.length / 2;
  for (let i = 0; i < len; i++) {
    let idx = i * 2;
    points.push({ x: data[idx], y: data[idx + 1] });
    path += `${data[idx]} ${data[idx + 1]} L `;
  }
  let canvasObject = null as any;
  if (
    points[0].y === points[1].y &&
    points[2].y === points[3].y &&
    points[0].x === points[3].x &&
    points[1].x - points[2].x
  ) {
    path = path.replace(/L\s$/g, "z");
    canvasObject = new fabric.Path(path, {
      left: data[0],
      top: data[1],
      stroke: state.color,
      selectable: false,
      strokeWidth: state.drawWidth,
      fill: "rgba(255, 255, 255, 0)",
      hasControls: false,
    });
  } else {
    canvasObject = new fabric.Polygon(points, {
      stroke: state.color,
      strokeWidth: state.drawWidth,
      fill: "rgba(255, 255, 255, 0)",
      opacity: 1,
      hasBorders: false,
      hasControls: false,
      evented: false,
    });
  }
  canvasObject["points"] = points;
  state.canvas.add(canvasObject);
};
const drawTypeChange = (e) => {
  state.drawType = e;
  state.canvas.skipTargetFind = !!e;
  if (e == "pen") {
    // isDrawingMode为true 才可以自由绘画
    state.canvas.isDrawingMode = true;
  } else {
    state.canvas.isDrawingMode = false;
  }
};
// 鼠标按下时触发
const mousedown = (e) => {
  // 记录鼠标按下时的坐标
  var xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY);
  state.mouseFrom.x = xy.x;
  state.mouseFrom.y = xy.y;
  state.doDrawing = true;
  // 绘制多边形
  if (state.drawType !== "rectangle") {
    state.canvas.skipTargetFind = false;
    try {
      let len = state.drawType === "line" ? 2 : 4;
      if (state.polygonMode) {
        addPoint(e);
      }
      if (state.pointArray.length === len && state.polygonMode) {
        generatePolygon();
      }
    } catch (error) {
      console.log(error);
    }
  }
};
// 鼠标松开执行
const mouseup = (e) => {
  let xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY);
  state.mouseTo.x = xy.x;
  state.mouseTo.y = xy.y;
  state.drawingObject = null;
  state.moveCount = 1;
  if (state.drawType != "polygon" && state.drawType != "line") {
    state.doDrawing = false;
  }
  // 设置只允许绘制一个
  // let canvasObj = state.canvas.getObjects();
  // if(canvasObj.length >2){
  //   state.canvas.remove(canvasObj[1])
  // }
};
//鼠标移动过程中已经完成了绘制
const mousemove = (e) => {
  if (state.moveCount % 2 && !state.doDrawing) {
    //减少绘制频率
    return;
  }
  state.moveCount++;
  var xy = e.pointer || transformMouse(e.e.offsetX, e.e.offsetY);
  if (xy.y >= 0 && xy.x <= props.cWidth && xy.y >= 0 && xy.y <= props.cHeight) {
    state.mouseTo.x = xy.x;
    state.mouseTo.y = xy.y;
    // 矩形
    if (state.drawType == "rectangle") {
      if (
        state.mouseFrom.x < state.mouseTo.x &&
        state.mouseFrom.y < state.mouseTo.y
      ) {
        drawing(e);
      } else {
        // clearAll();
      }
    }
    if (state.drawType !== "rectangle") {
      if (state.activeLine && state.activeLine.class == "line") {
        var pointer = state.canvas.getPointer(e.e);
        state.activeLine.set({ x2: pointer.x, y2: pointer.y });

        var points = state.activeShape.get("points");
        points[state.pointArray.length] = {
          x: pointer.x,
          y: pointer.y,
          zIndex: 1,
        };
        state.activeShape.set({
          points: points,
        });
        state.canvas.renderAll();
      }
      state.canvas.renderAll();
    }
  } else {
    // clearAll();
  }
};
// 绘制矩形
const drawing = (_event) => {
  if (state.drawingObject) {
    state.canvas.remove(state.drawingObject);
  }
  let canvasObject = null;
  let left = state.mouseFrom.x,
    top = state.mouseFrom.y,
    mouseFrom = state.mouseFrom,
    mouseTo = state.mouseTo;
  var path =
    "M " +
    mouseFrom.x +
    " " +
    mouseFrom.y +
    " L " +
    mouseTo.x +
    " " +
    mouseFrom.y +
    " L " +
    mouseTo.x +
    " " +
    mouseTo.y +
    " L " +
    mouseFrom.x +
    " " +
    mouseTo.y +
    " L " +
    mouseFrom.x +
    " " +
    mouseFrom.y +
    " z";
  state.rectPath = path;
  canvasObject = new fabric.Path(path, {
    left: left,
    top: top,
    stroke: state.color,
    selectable: false,
    strokeWidth: state.drawWidth,
    fill: "rgba(255, 255, 255, 0)",
    hasControls: false,
  });
  if (canvasObject) {
    state.canvas.add(canvasObject);
    state.drawingObject = canvasObject;
  }
};
// 绘制多边形开始，绘制多边形和其他图形不一样，需要单独处理
const drawPolygon = (type) => {
  state.drawType = type;
  state.polygonMode = true;
  //这里画的多边形，由顶点与线组成
  state.pointArray = new Array(); // 顶点集合
  state.lineArray = new Array(); //线集合
  state.canvas.isDrawingMode = false;
};
const addPoint = (e) => {
  let random = Math.floor(Math.random() * 10000);
  let id = new Date().getTime() + random;
  let circle = new fabric.Circle({
    radius: 5,
    fill: "#ffffff",
    stroke: "#333333",
    strokeWidth: 0.5,
    left: (e.pointer.x || e.e.layerX) / state.canvas.getZoom(),
    top: (e.pointer.y || e.e.layerY) / state.canvas.getZoom(),
    selectable: false,
    hasBorders: false,
    hasControls: false,
    originX: "center",
    originY: "center",
    id: id,
    objectCaching: false,
  });
  if (state.pointArray.length == 0) {
    circle.set({
      fill: "#00FFFF",
    });
  }
  var points = [
    (e.pointer.x || e.e.layerX) / state.canvas.getZoom(),
    (e.pointer.y || e.e.layerY) / state.canvas.getZoom(),
    (e.pointer.x || e.e.layerX) / state.canvas.getZoom(),
    (e.pointer.y || e.e.layerY) / state.canvas.getZoom(),
  ];

  state.line = new fabric.Line(points, {
    strokeWidth: 2,
    fill: "#999999",
    stroke: "#999999",
    class: "line",
    originX: "center",
    originY: "center",
    selectable: false,
    hasBorders: false,
    hasControls: false,
    evented: false,

    objectCaching: false,
  });
  if (state.activeShape) {
    let pos = state.canvas.getPointer(e.e);
    let points = state.activeShape.get("points");
    points.push({
      x: pos.x,
      y: pos.y,
    });
    var polygon = new fabric.Polygon(points, {
      stroke: "#333333",
      strokeWidth: 1,
      fill: "#cccccc",
      opacity: 0.3,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    });
    state.canvas.remove(state.activeShape);
    state.canvas.add(polygon);
    state.activeShape = polygon;
    state.canvas.renderAll();
  } else {
    var polyPoint = [
      {
        x: (e.pointer.x || e.e.layerX) / state.canvas.getZoom(),
        y: (e.pointer.y || e.e.layerY) / state.canvas.getZoom(),
      },
    ];
    var polygon = new fabric.Polygon(polyPoint, {
      stroke: "#333333",
      strokeWidth: 1,
      fill: "#cccccc",
      opacity: 0.3,
      selectable: false,
      hasBorders: false,
      hasControls: false,
      evented: false,
      objectCaching: false,
    });
    state.activeShape = polygon;
    state.canvas.add(polygon);
  }
  state.activeLine = state.line;

  state.pointArray.push(circle);
  state.lineArray.push(state.line);
  state.canvas.add(state.line);
  state.canvas.add(circle);
};
// 绘制不规则四边形
const generatePolygon = () => {
  let points = clearPolygonLines();
  var polygon = new fabric.Polygon(sortPoints(points), {
    stroke: state.color,
    strokeWidth: state.drawWidth,
    fill: "rgba(255, 255, 255, 0)",
    opacity: 1,
    hasBorders: false,
    hasControls: false,
    evented: false,
  });
  state.canvas.add(polygon);
  resetPolygon();
};
// 坐标转换
const transformMouse = (mouseX, mouseY) => {
  return { x: mouseX / 1, y: mouseY / 1 };
};
// 重置不规则四边形
const resetPolygon = () => {
  state.activeLine = null;
  state.activeShape = null;
  state.polygonMode = false;
  state.doDrawing = false;
  state.drawType = "rectangle";
};
// 清除绘制四边形的四个坐标点
const clearPolygonLines = () => {
  let points = new Array();
  state.pointArray.forEach((point) => {
    points.push({
      x: point.left,
      y: point.top,
    });
    state.canvas.remove(point);
  });
  state.lineArray.forEach((line) => {
    state.canvas.remove(line);
  });
  state.canvas.remove(state.activeShape).remove(state.activeLine);
  return points;
};
// 撤销最后一次的操作
const clearObjLast = () => {
  let canvasObjs = state.canvas.getObjects();
  let len = canvasObjs.length;
  if (len > 1) {
    state.canvas.remove(canvasObjs[len - 1]);
  }
};
// 全部清除
const clearAll = () => {
  state.canvas.getObjects().forEach((element, index) => {
    if (index > 0) {
      state.canvas.remove(element);
    }
  });
  clearPolygonLines();
  resetPolygon();
  state.drawType = "rectangle";
};
const getPoint = (pi) => {
  return Math.floor(pi / state.radio);
};
const getRealPoint = (poi) => {
  let dx =
    Math.abs(
      state.imgPoint.x > poi.x
        ? state.imgPoint.x - poi.x
        : state.imgPoint.x + poi.x
    ) * state.realRadio;
  let dy =
    Math.abs(
      state.imgPoint.y > poi.y
        ? state.imgPoint.y - poi.y
        : state.imgPoint.y + poi.y
    ) * state.realRadio;
  let rdx = Math.abs(state.realPoint.x - dx);
  let rdy = Math.abs(state.realPoint.y - dy);
  let minX = Math.min(Math.floor(rdx), props.width);
  let minY = Math.min(Math.floor(rdy), props.height);
  return { x: minX, y: minY };
};
// 生成真实分辨率图片的坐标点
const getData = () => {
  let datas = [] as any;
  let marks = ["tl", "tr", "br", "bl"];
  if (state.lineArray.length > 0 && state.lineArray.length < 4) {
    clearPolygonLines();
  }
  state.canvas.getObjects().forEach((item, index) => {
    if (index > 0) {
      let aCoords = item.aCoords;
      let point = {};
      if (item.points) {
        item.points.forEach((item, idx) => {
          if (aCoords[marks[idx]]) {
            aCoords[marks[idx]].x = item.x;
            aCoords[marks[idx]].y = item.y;
          }
        });
      }
      marks.forEach((mark) => {
        let poi = {
          x: getPoint(aCoords[mark].x),
          y: getPoint(aCoords[mark].y),
        };
        point[mark] = getRealPoint(poi);
      });
      if (item.points && item.points.length === 2) {
        delete point["br"];
        delete point["bl"];
      }
      datas.push(point);
    }
  });
  return datas;
};
defineExpose({ drawType: state.drawType, clearObjLast, clearAll, getData });
onMounted(() => {
  loadInit();
});
</script>

<style lang="less" scoped>
canvas {
  border: 1px dashed black;
}
.loading-box {
  width: 960px;
  height: 540px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 14px;
  color: #ea5413;
}
.draw-btn-group {
  width: 960px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .active {
    .draw-rect {
      background: #ff00ff;
      border-color: #ff00ff;
    }
  }
  .shape-box {
    text-align: left;
    width: 120px;
  }
  .shape-border {
    display: block;
    width: 80px;
    height: 30px;
    text-align: center;
    font-size: 12px;
    margin-right: 30px;
  }
  .shape-border-ti {
    transform: skewX(-45deg);
  }
  .draw-icon {
    display: inline-block;
    width: 80px;
    height: 30px;
  }
  .draw-rect {
    width: 80px;
    border-width: 1px;
    border-style: solid;
    border-color: #333;
  }

  .draw-line {
    position: relative;
    top: -14px;
    border-bottom: 2px solid #00ffff;
  }
}
</style>
