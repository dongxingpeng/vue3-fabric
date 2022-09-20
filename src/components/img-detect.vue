<template>
  <a-modal
    class="modal-canvas"
    v-model:visible="visible"
    title="添加区域"
    width="980px"
    height="600px"
    :footer="null">
    <ImgMaker
      ref="imgMaker"
      v-if="visible"
      :src="cover"
      :area="area"
      :width="width"
      :height="height"></ImgMaker>
    <div style="text-align: center">
      <a-space>
        <a-button type="primary" @click="onClearLast">撤销最后一次的操作</a-button>
        <a-button type="primary" @click="onClearAll">清空所有</a-button>
        <a-button type="primary" @click="onCancel">取消</a-button>
        <a-button type="primary" @click="onSubmit">保存</a-button>
      </a-space>
    </div>
  </a-modal>
</template>
<script lang="ts" setup>
import { reactive, ref, toRefs } from "vue";
import ImgMaker from "./img-maker.vue";
const props = defineProps({
  area: {
    type: String,
    default: "",
  },
  img: {
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
});
const emit = defineEmits(["success"]);
const imgMaker = ref();
const state = reactive({
  visible: false,
  cover: "",
});
const { visible, cover } = toRefs(state);
state.cover = props.img;
const onClearAll = () => {
  imgMaker.value.clearAll();
};
const onClearLast = () => {
  imgMaker.value.clearObjLast();
};
const onCancel = () => {
  onClearAll();
  state.visible = false;
  imgMaker.value.drawType = "rectangle";
};
const onSubmit = () => {
  let points = imgMaker.value.getData();
  let datas = [];
  if (points.length > 0) {
    datas = points.map((point) => {
      if (point.br) {
        return `${point.tl.x};${point.tl.y};${point.tr.x};${point.tr.y};${point.br.x};${point.br.y};${point.bl.x};${point.bl.y}`;
      }
      return `${point.tl.x};${point.tl.y};${point.tr.x};${point.tr.y}`;
    });
  }
  emit("success", datas.join(","));
  onClearAll();
  state.visible = false;
};
defineExpose({ visible, cover });
</script>
