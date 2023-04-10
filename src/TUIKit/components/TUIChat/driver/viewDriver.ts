import {Animated, LayoutChangeEvent} from 'react-native';
import type {Driver, DriverState} from './driver';

export class ViewDriver implements Driver {
  constructor(public name: string) {}

  // 输入框距屏幕底部的距离
  private senderBottom = 0;

  private y = 0;
  private animation = new Animated.Value(0);

  shown = false;
  height = 0;
  messageListHeight = 0;
  messageListContainerHeight = 0;

  show = (state: DriverState) => {
    console.log('show');
    const {bottom, driver, setDriver, setTranslateY, setTranslateMLY} = state;

    if (driver && driver !== this) {
      // 记录主界面当前位置
      this.y = driver.shown ? driver.height : 0;
      // 隐藏前一个 driver
      driver.hide({
        bottom,
        driver: this,
        setDriver,
        setTranslateY,
        setTranslateMLY,
      });
    }

    this.shown = true;
    this.senderBottom = bottom;
    setDriver(this);
    setTranslateY(this.translateY);
    setTranslateMLY(
      this.messageListHeight === this.messageListContainerHeight
        ? this.translateY
        : this.translateMLY,
    );

    Animated.timing(this.animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  hide = (state: DriverState) => {
    const {bottom, driver, setDriver, setTranslateY, setTranslateMLY} = state;

    this.shown = false;
    this.y = 0;
    this.senderBottom = bottom;

    if (driver === this) {
      setDriver(undefined);
      setTranslateY(this.translateY);
      setTranslateMLY(
        this.messageListHeight === this.messageListContainerHeight
          ? this.translateY
          : this.translateMLY,
      );
      Animated.timing(this.animation, {
        toValue: this.height,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      this.animation.setValue(this.height);
    }
  };

  toggle = (state: DriverState) => {
    this.shown ? this.hide(state) : this.show(state);
  };

  style = {
    transform: [
      {
        translateY: this.animation,
      },
    ],
  };

  private get position() {
    return this.animation.interpolate({
      inputRange: [0, this.height],
      outputRange: [this.height, 0],
    });
  }

  private get translateY() {
    const extraHeight = this.senderBottom;
    console.log(
      this.name,
      'height',
      this.height,
      'y',
      this.y,
      'extraHeight',
      extraHeight,
    );
    if (!this.shown || this.y === 0) {
      return this.position.interpolate({
        inputRange: [extraHeight, this.height],
        outputRange: [0, extraHeight - this.height],
        extrapolate: 'clamp',
      }) as Animated.Value;
    } else {
      return this.position.interpolate({
        inputRange: [0, this.height],
        outputRange: [extraHeight - this.y, extraHeight - this.height],
        extrapolate: 'clamp',
      }) as Animated.Value;
    }
  }

  private get translateMLY() {
    const extraHeight = this.senderBottom;
    console.log(
      this.name,
      'height',
      this.height,
      'y',
      this.y,
      'extraHeight',
      extraHeight,
      'messageListHeight',
      this.messageListHeight,
      'messageListContainerHeight',
      this.messageListContainerHeight,
    );

    const distanceWithFill =
      this.messageListContainerHeight - this.messageListHeight;
    const targePosition = Math.abs(extraHeight - this.height);
    const haveEnoughArea = distanceWithFill > targePosition;

    if (!this.shown || this.y === 0) {
      return this.position.interpolate({
        inputRange: [extraHeight, this.height],
        outputRange: [
          0,
          haveEnoughArea ? 0 : extraHeight - this.height + distanceWithFill,
        ],
        extrapolate: 'clamp',
      }) as Animated.Value;
    } else {
      return this.position.interpolate({
        inputRange: [0, this.height],
        outputRange: [
          haveEnoughArea ? 0 : extraHeight - this.y + distanceWithFill,
          haveEnoughArea ? 0 : extraHeight - this.height + distanceWithFill,
        ],
        extrapolate: 'clamp',
      }) as Animated.Value;
    }
  }

  onLayout = (event: LayoutChangeEvent) => {
    this.animation.setValue(event.nativeEvent.layout.height);
    this.height = event.nativeEvent.layout.height;
  };

  onMessageListLayout = (event: LayoutChangeEvent) => {
    this.messageListHeight = event.nativeEvent.layout.height;
  };

  onFillMessageLayout = (height: number) => {
    this.messageListContainerHeight = height;
  };
}
