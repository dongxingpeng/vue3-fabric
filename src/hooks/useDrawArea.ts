export const useDrawArea = (
  params = {
    src: "",
    width: 1920,
    height: 1080,
    area: "",
  }
) => {
  const { src, width, height, area } = params;
  return new Promise((resolve, reject) => {
    if (src && src != "" && area && area != "") {
      let cvs = document.createElement("canvas");
      let ctx: CanvasRenderingContext2D | null = cvs.getContext("2d");
      let img = new Image();
      img.setAttribute("crossOrigin", "anonymous");
      img.src = src;
      let points = area.split(",").map((item) => {
        return item.split(";").map((arss) => Number(arss));
      });
      img.onload = () => {
        cvs.width = width;
        cvs.height = height;
        if (ctx) {
          ctx?.drawImage(img, 0, 0, width, height);
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 2;
          points.forEach((ar) => {
            ctx?.beginPath();
            ctx?.moveTo(ar[0], ar[1]);
            ctx?.lineTo(ar[2], ar[3]);
            if (ar.length > 4) {
              ctx?.lineTo(ar[4], ar[5]);
              ctx?.lineTo(ar[6], ar[7]);
            }
            ctx?.closePath();
            ctx?.stroke();
          });
        }
        let url:string = cvs.toDataURL("image/png") || "";
        resolve(url);
      };
    } else {
      reject("");
    }
  });
};
