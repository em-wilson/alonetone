import PlaybackController from './playback_controller'
import PlayAnimation from '../animation/play_animation'

let currentlyOpen
let animation = new PlayAnimation()

export default class extends PlaybackController {
  // these are added to the targets defined in PlaybackController
  static targets = ['playButton', 'details', 'time', 'seekBarPlayed', 'title']

  preInitialize() {
    animation = new PlayAnimation()
    this.preload = false
    this.url = this.playTarget.querySelector('a').getAttribute('href')
    this.titleTarget.querySelector('.track_link').style.width = `${this.element.clientWidth - 90}px`
  }

  whilePlayingCallback() {
    animation.showPause()
    this.updateSeekBarPlayed()
    this.timeTarget.innerHTML = this.time
  }

  playCallback() {
    if (!this.loaded) this.animateLoading()
    else animation.setPause()
    this.openDetails()
    this.updateSeekBarLoaded()
  }
  
  pauseCallback() {
    animation.setPlay()
    document.getElementById('play-svg-container').append(document.getElementById('playAnimationSVG'))
    this.playButtonTarget.style.display = 'block'
  }

  toggleDetails(e) {    
    if (!e.target.classList.contains('artist') ) {
      // if the link in the track top is the artist link, go to that URL,
      // otherwise open the track reveal section
      e.preventDefault()

      const wasOpen = this.element.classList.contains('open')
      // if another track details is open, close it
      if (currentlyOpen) {
        currentlyOpen.element.classList.remove('open')
      }
      if (!wasOpen && !this.data.get('openable')) {
        this.openDetails()
      }
    }
  }

  openDetails() {
    if (currentlyOpen) {
      currentlyOpen.element.classList.remove('open')
    }
    currentlyOpen = this
    this.detailsTarget.style.display = 'block'
    this.detailsTarget.style.marginTop = `-${this.detailsTarget.offsetHeight}px`
    this.element.classList.add('open')
  }

  animateLoading() {
    this.playButtonTarget.style.display = 'none'
    this.playTarget.firstElementChild.append(document.getElementById('playAnimationSVG'))
    animation.init()
    animation.setPlay()
    animation.showLoading()
  }

  // With SoundManager we used to animate this width to display
  // how much of the track is downloaded
  // but it's no longer possible with Howl
  updateSeekBarLoaded() {
    this.seekBarContainerTarget.style.display = 'block'
    this.seekBarLoadedTarget.style.width = '100%'
  }
  updateSeekBarPlayed() {
    const position = this.position / this.sound.duration()
    const maxwidth = this.seekBarLoadedTarget.offsetWidth
    this.seekBarPlayedTarget.style.width = `${position * maxwidth}px`
  }

  seek(e) {
    const offset = e.clientX - this.seekBarContainerTarget.getBoundingClientRect().left
    const newPosition = offset / this.seekBarContainerTarget.offsetWidth
    super.seek(newPosition)
  }

  skim(e) {
    const offx = e.clientX - this.seekBarContainerTarget.getBoundingClientRect().left
    this.seekBarLoadedTarget.style.left = `${offx}px`
  }

  // turbolinks will cache this page, so here's our chance to reset things to normal
  disconnect() {
    if (this.element.classList.contains('open')) {
      this.element.classList.remove('open')
    }
  }
}