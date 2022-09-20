<template>
  <img :src="cover" alt="" style="width: 576px; height: 324px" />
  <div style="margin: 10px 0">
    <a-space>
      <a-button type="primary" @click="handleDelArea">删除所有</a-button>
      <a-button type="primary" @click="handleArea">添加</a-button>
    </a-space>
  </div>
  <div>区域坐标：{{ area.split(",") }}</div>

  <img-detect
    ref="imgDetect"
    :img="cover"
    :area="area"
    :width="width"
    :height="height"
    @success="handleImgSuccess"></img-detect>
</template>
<script lang="ts" setup>
import ImgDetect from "@/components/img-detect.vue";
import { message } from "ant-design-vue";
import { reactive, ref, toRefs } from "vue";
import { useDrawArea } from "@/hooks/useDrawArea";
const state = reactive({
  area: "" as string,
  width: 1920 as number,
  height: 1080 as number,
  cover:"/public/a.jpg",
});

const imgDetect = ref();
const getList = () => {
  state.cover = "/public/a.jpg";
  useDrawArea({
    src: state.cover,
    width: state.width,
    height: state.height,
    area: state.area,
  })
    .then((url) => {
      state.cover = url as string;
    })
    .catch(() => {});
};

const handleArea = () => {
  if (state.cover != "") {
    imgDetect.value.visible = true;
  } else {
    message.warning("缺失图像,暂时不能进行区域添加！");
  }
};
const handleDelArea = () => {
  state.area = "";
  getList();
};
const handleImgSuccess = (data) => {
  state.area = data;
  getList()
};
const { area, width, height, cover } = toRefs(state);
</script>
