class WebsyNavigator {
  constructor(options) {
    const defaults = {
      menuClass: "nav-item",
      viewClass: "view",
      activeClass: "active",
      viewAttribute: "data-view",
      groupAttribute: "data-group",
      defaultView: "",
      defaultGroup: "main",
      subscribers: []
    }
    window.addEventListener('popstate', this.onPopState.bind(this))
    this.options = Object.assign({}, defaults, options)
    // add any necessary CSS if the viewClass has been changed
    if (this.options.viewClass!==defaults.viewClass || this.options.activeClass!==defaults.activeClass) {
      let style = `
        <style>
          .${this.options.viewClass}{ display: none; }
          .${this.options.viewClass}.${this.options.activeClass}{ display: initial; }
        </style>
      `
      document.querySelector("head").innerHTML += style
    }
    let menuItems = document.getElementsByClassName(this.options.menuClass)
    for (let i = 0; i < menuItems.length; i++) {
      // get the view for each item
      let viewAttr = menuItems[i].attributes[this.options.viewAttribute]
      if (viewAttr && viewAttr.value!=="") {
        // check to see if the item belongs to a group
        // use the group to add an additional class to the item
        // this combines the menuClass and groupAttr properties
        let groupAttr = menuItems[i].attributes[this.options.groupAttribute]
        let group = this.options.defaultGroup
        if (groupAttr && groupAttr.value!=="") {
          // if no group is found, assign it to the default group
          group = groupAttr.value
        }
        menuItems[i].classList.add(`${this.options.menuClass}-${group}`)
        menuItems[i].addEventListener("click", this.navigate.bind(this, viewAttr.value, group))
      }
    }
    // Assign group class to views
    let viewItems = document.getElementsByClassName(this.options.viewClass)
    for (let i = 0; i < viewItems.length; i++) {
      let groupAttr = viewItems[i].attributes[this.options.groupAttribute]
      if (!groupAttr || groupAttr.value==="") {
        // if no group is found, assign it to the default group
        viewItems[i].classList.add(`${this.options.viewClass}-${this.options.defaultGroup}`)
      }
      else {
        viewItems[i].classList.add(`${this.options.viewClass}-${groupAttr.value}`)
      }
    }
    this.navigate(this.currentPath, this.options.defaultGroup)
  }
  navigate(path, group){
    if (path=="") {
      path = this.options.defaultView
    }
    this.hideMenuItems(group)
    this.hideViewItems(group)
    this.activateItem(path, this.options.menuClass)
    this.activateItem(path, this.options.viewClass)
    let oldPath = this.currentPath
    if(this.currentPath!==path && group===this.options.defaultGroup){
      history.pushState({
        path
      }, path, path)
    }
    this.options.subscribers.forEach((item)=>{
      item.call(null, path, oldPath)
    })
  }
  onPopState(event){
    this.navigate(event.state.path)
  }
  subscribe(fn){
    this.options.subscribers.push(fn)
  }
  get currentPath(){
    let path = window.location.pathname.split("/").pop()
    if (path.indexOf(".htm")!==-1) {
      return ""
    }
    return path
  }
  hideMenuItems(group){
    let c = this.options.menuClass
    if (group) {
      c += `-${group}`
    }
    this.hideItems(c)
  }
  hideViewItems(group){
    let c = this.options.viewClass
    if (group) {
      c += `-${group}`
    }
    this.hideItems(c)
  }
  hideItems(className){
    let els = document.getElementsByClassName(className)
    if (els) {
      for (var i = 0; i < els.length; i++) {
        els[i].classList.remove(this.options.activeClass)
      }
    }
  }
  activateItem(path, className){
    let els = document.getElementsByClassName(className)
    if (els) {
      for (var i = 0; i < els.length; i++) {
        if(els[i].attributes[this.options.viewAttribute] && els[i].attributes[this.options.viewAttribute].value===path){
          els[i].classList.add(this.options.activeClass)
          break
        }
      }
    }
  }
}
