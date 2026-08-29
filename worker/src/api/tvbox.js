export function outputTVBox(list) {
  return new Response(JSON.stringify({
    class: [
      {
        type_id: "all",
        type_name: "全部直播"
      }
    ],
    list: list.map((i, index) => ({
      vod_id: `live_${index}`,
      vod_name: i.title,
      vod_pic: i.logo || "",
      vod_remarks: i.group,
      vod_play_from: "在线播放",
      vod_play_url: `线路$${i.url}`
    }))
  }), {
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    }
  });
}
