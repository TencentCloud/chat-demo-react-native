export * from './CheckBox';
// Radio
// const Item = (props: any) => {
//   const { index = -1, checkedIndex = -1, setCheckedIndex } = props;
//   const _setCheckedIndex = () => {
//     setCheckedIndex && setCheckedIndex(index);
//   }
//   return (
//     <TouchableOpacity
//       delayPressIn={0}
//       activeOpacity={1}
//       onPress={_setCheckedIndex}
//     >
//       <CheckBox checked={checkedIndex === index} />
//     </TouchableOpacity>
//   );
// }

// CheckBox
// const Item = (props: any) => {
//   const { index = -1 } = props;
//   const [checked, setChecked] = useState<boolean>(false);
//   // record index when checked is updated
//   const toggleCheckBox = () => {
//     setChecked(!checked);
//   }
//   return (
//     <TouchableOpacity
//       delayPressIn={0}
//       activeOpacity={1}
//       onPress={toggleCheckBox}
//     >
//       <CheckBox checked={checked} />
//     </TouchableOpacity>
//   );
// }
