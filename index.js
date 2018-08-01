var Footer = {
  init: function(){
    this.$footer = $('footer')
    this.$ul = this.$footer.find('ul')
    this.$box = this.$footer.find('.box')
    this.$leftBtn = this.$footer.find('.fa-chevron-left')
    this.$rightBtn = this.$footer.find('.fa-chevron-right')
    this.isToEnd = false
    this.isToStart = true

    this.bind()
    this.render()

  },
  bind:function(){
    var _this = this
    this.$rightBtn.on('click',function(){
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width()/itemWidth)

      if(!_this.isToEnd){
        _this.$ul.animate({
          left: '-=' + rowCount * itemWidth
        }, 400,function(){
          _this.isToStart = false
          if(parseFloat(_this.$box.width()) - parseFloat(_this.$ul.css('left')) >= parseFloat(_this.$ul.css('width'))){
            _this.isToEnd = true
          }
        })
      }
    })

    this.$leftBtn.on('click', function () {
      var itemWidth = _this.$box.find('li').outerWidth(true)
      var rowCount = Math.floor(_this.$box.width() / itemWidth)

      if (!_this.isToStart) {
        _this.$ul.animate({
          left: '+=' + rowCount * itemWidth
        }, 400, function () {
          _this.isToEnd = false
          if (parseFloat(_this.$ul.css('left')) >= 0) {
            _this.isToStart = true
          }
        })
      }
    })
  },
  
  render:function(){
    var _this = this
    $.ajax({
      url:'http://api.jirengu.com/fm/getChannels.php',
      dataType:'JSON',
    }).done(function(ret){
      console.log(ret)
      _this.renderFooter(ret.channels)
    }).fail(function(){
      console.log('error')
    })
  },
  renderFooter:function(channels){
    console.log(channels)
    var html = ''
    channels.forEach(function(channel){
      html += '<li data-channel-id='+channel.channel_id+'>'
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
Footer.init()