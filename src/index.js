import BottomSheet from './BottomSheet.vue';

export { BottomSheet };

export default {
  install: (app, options) => {
    const componentName = options?.componentName || 'BottomSheet';
    app.component(componentName, BottomSheet);
  }
};