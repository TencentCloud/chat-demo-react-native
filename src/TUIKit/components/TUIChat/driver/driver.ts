import type {Animated} from 'react-native';

export interface DriverState {
  bottom: number;
  driver: Driver | undefined;
  setDriver: React.Dispatch<React.SetStateAction<Driver | undefined>>;
  setTranslateY: React.Dispatch<React.SetStateAction<Animated.Value>>;
  setTranslateMLY: React.Dispatch<React.SetStateAction<Animated.Value>>;
}

export interface Driver {
  show: (state: DriverState) => void;
  hide: (state: DriverState) => void;
  toggle: (state: DriverState) => void;
  shown: boolean;
  height: number;
  name: string;
}
