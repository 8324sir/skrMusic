var EventCenter = {
  on:function(type,handler){
    $(document).on(type,handler)
  },
  fire:function(type,data){
    $(document).trigger(type,data)
  }
}

//底部歌曲展示栏相关
var Footer = {
  init: function(){
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.fa-chevron-left')
    this.$rightBtn = this.$footer.find('.fa-chevron-right')
    this.isToEnd = false
    this.isToStart = true
    this.isAnimate = false //判断用户是否连续点击按钮

    this.bind()
    this.render()

  },
  bind:function(){
    var _this = this
    //右箭头
    this.$rightBtn.on('click',function(){
      if(_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width()/itemWidth)
      //判断ul中是否还有item。如果没有箭头就停止滚动。
      if(!_this.isToEnd){
        _this.isAnimate = true
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400,function(){
          _this.isAnimate = false 
          _this.isToStart = false
          if(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))){
            _this.isToEnd = true
          }
        })
      }
    })
    //左箭头
    this.$leftBtn.on('click', function () {
      if(_this.isAnimate) return
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)
      if (!_this.isToStart) {
        _this.isAnimate = true
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isAnimate = false
          _this.isToEnd = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })
    
    this.$footer.on('click','li',function(){
      $(this).addClass('active').siblings().removeClass('active')
      EventCenter.fire('select-albumn',{
        channelId:$(this).attr('data-channel-id'),
        channelName: $(this).attr('data-channel-name')
      })
    })
  },
  
  render:function(){
    var _this = this
    $.ajax({
      url:'//api.jirengu.com/fm/getChannels.php',
      dataType:'json',
    }).done(function(ret){
      _this.renderFooter(ret.channels)
    }).fail(function(){
      console.log('error')
    })
  },
  //渲染
  renderFooter:function(channels){
    var html = ''
    channels.forEach(function(channel){
      html += '<li data-channel-id='+channel.channel_id+' data-channel-name='+channel.name+'>'
            +'  <div class="cover"style="background-image:url('+channel.cover_small+')"></div>'
            +'  <h3>'+channel.name+'</h3>'
            +'</li>'
    })
    this.$ul.html(html)
    this.setStyle()
  },
  setStyle:function(){
    var count = this.$footer.find('li').length
    var width = this.$footer.find('li').outerWidth(true)
    this.$ul.css({
      width:count * width + 'px'
    })
  }
}

var FM = {
  init:function(){
    this.$container = $('#page-music')
    this.audio = new Audio()
    this.audio.autoplay = true

    this.bind()
  },
  bind: function(){
    var _this = this
    //选择歌曲后开始加载音乐
    EventCenter.on('select-albumn',function(e,channelObj){
      _this.channelId = channelObj.channelId
      _this.channelName = channelObj.channelName
      _this.loadMusic()
    })
    //歌曲播放暂停功能
    this.$container.find('.btn-play').on('click',function(){
      var $btn = $(this)
      if($btn.hasClass('fa-play')){
        $btn.removeClass('fa-play').addClass('fa-pause')
        _this.audio.play()
      }else{
        $btn.removeClass('fa-pause').addClass('fa-play')
        _this.audio.pause()
      }
    })
    //下一首
    this.$container.find('.btn-next').on('click',function(){
      _this.loadMusic()
    })

    this.audio.addEventListener('play',function(){
      clearInterval(_this.statusClock)
      _this.statusClock = setInterval(function(){
        _this.updateStatus()
      },1000)
    })

    this.audio.addEventListener('pause',function(){
      clearInterval(_this.statusClock)
    })
  },
  loadMusic(callback){
    var _this = this
    $.ajax({
      url:'//jirenguapi.applinzi.com/fm/getSong.php',
      dataType:'json',
      data:{
        channel:this.channelId
      }
    }).done(function(ret){
      _this.song = ret['song'][0]
      _this.setMusic()
      _this.loadLyric()
    })
  },
  
  //加载歌词
  loadLyric(){
    var _this = this
    $.ajax({
      url:'//jirenguapi.applinzi.com/fm/getLyric.php',
      dataType:'json',
      data:{
        sid:this.song.sid
      }
    }).done(function(ret){
      var lyric = ret.lyric
      var lyricObj = {}
      lyric.split('\n').forEach(function(line){
        var times = line.match(/\d{2}:\d{2}/g)
        var str = line.replace(/\[.+?\]/g, '')
        if(Array.isArray(times)){
          times.forEach(function(time){
            lyricObj[time] = str
          })
        }
      })
      _this.lyricObj = lyricObj
    })
  },

  setMusic(){
    console.log(this.song)
    this.audio.src = this.song.url
    $('.bg').css('background-image','url('+this.song.picture+')')
    this.$container.find('.aside figure').css('background-image', 'url(' + this.song.picture +')')
    this.$container.find('.detail h1').text(this.song.title)
    this.$container.find('.detail .author').text(this.song.artist)
    this.$container.find('.tag').text(this.channelName)
    this.$container.find('.btn-play').removeClass('fa-play').addClass('fa-pause')
  },
  //播放时间跟歌词进度条
  updateStatus(){
    var min = Math.floor(this.audio.currentTime / 60)
    var second = Math.floor(FM.audio.currentTime %60) + '';
    second = second.length === 2?second:'0' + second
    this.$container.find('.current-time').text(min + ':' + second)
    this.$container.find('.bar-progress').css('width',this.audio.currentTime/this.audio.duration*100+'%')
    
    var line = this.lyricObj['0' + min + ':' + second]
    if(line){
      this.$container.find('.lyric p').text(line)
    }
  }

}

Footer.init()
FM.init()