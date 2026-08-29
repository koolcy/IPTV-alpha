export function decode(buffer){
  try {
    return new TextDecoder('utf-8',{fatal:true}).decode(buffer);
  } catch(e){
    return new TextDecoder('gbk').decode(buffer);
  }
}
