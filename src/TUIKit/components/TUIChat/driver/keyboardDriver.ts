import {Keyboard, Animated, LayoutChangeEvent} from 'react-native';
import type {KeyboardState} from 'react-native-keyboard-insets';
import type {TUIMessageInputRef} from '../../TUIMessageInput/tui_message_input';
import type {Driver, DriverState} from './driver';

export class KeyboardDriver implements Driver {
  constructor(private inputRef: React.RefObject<TUIMessageInputRef>) {}
  // 输入框距屏幕底部的距离
  private senderBottom = 0;
  private y = 0;
  private position = new Animated.Value(0);

  name = 'keyboard';
  shown = false;
  height = 0;
  messageListHeight = 0;
  messageListContainerHeight = 0;

  show = () => {
    this.inputRef.current?.getTextInputRef().current?.focus();
  };

  hide = () => {
    Keyboard.dismiss();
  };

  toggle = () => {
    this.shown ? this.hide() : this.show();
  };

  createCallback = (state: DriverState) => {
    return (keyboard: KeyboardState) => {
      const {shown, height, position} = keyboard;

      const {bottom, driver, setDriver, setTranslateY, setTranslateMLY} = state;
      const heightChanged = height !== this.height;

      this.height = height;
      this.position = position;
      this.senderBottom = bottom;

      if (shown && (!this.shown || heightChanged)) {
        this.shown = true;
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
        setDriver(this);
        setTranslateY(this.translateY);
        setTranslateMLY(
          this.messageListHeight === this.messageListContainerHeight
            ? this.translateY
            : this.translateMLY,
        );
      }

      if (!shown && this.shown) {
        this.shown = false;
        this.y = 0;
        if (driver === this) {
          setDriver(undefined);
          setTranslateY(this.translateY);
          setTranslateMLY(
            this.messageListHeight === this.messageListContainerHeight
              ? this.translateY
              : this.translateMLY,
          );
        }
      }
    };
  };

  onMessageListLayout = (event: LayoutChangeEvent) => {
    this.messageListHeight = event.nativeEvent.layout.height;
  };

  onFillMessageLayout = (height: number) => {
    this.messageListContainerHeight = height;
  };

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
}
