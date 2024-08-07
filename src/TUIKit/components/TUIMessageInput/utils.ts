export class Utils {
    static compareString(oldText:string,newText:string){
        const isAddText:boolean = newText.length > oldText.length;
        const longerText = isAddText? newText:oldText;
        const shorterText = isAddText?oldText:newText;
        let diffIndex = -1;
        for(let i=0;i<shorterText.length;i++){
            if(longerText[i] != shorterText[i]){
                diffIndex = i;
                break;
            }
        }
        if(diffIndex == -1){
            diffIndex = shorterText.length;
        }
        let characters:string = longerText.substring(diffIndex,longerText.length-shorterText.length + diffIndex);
        return {
            characters:characters,
            index:diffIndex,
            isAddText:isAddText
        }
    }
    static max(value: number, minValue: number): number {
        return value < minValue ? minValue : value;
      }
}