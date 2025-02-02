window.addEventListener("load", () => {
  navigator.serviceWorker.register("../sw.js?v=5-5-2024", { scope: "/a/" })
  const form = document.getElementById("fs")
  const input = document.getElementById("is")
  if (form && input) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault()
      const formValue = input.value.trim()
      const url = isUrl(formValue) ? prependHttps(formValue) : "https://www.google.com/search?q=" + formValue
      processUrl(url)
    })
  }
  function processUrl(url) {
    sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url))
    const iframeContainer = document.getElementById("iframe-container")
    const activeIframe = Array.from(iframeContainer.querySelectorAll("iframe")).find((iframe) => iframe.classList.contains("active"))
    activeIframe.src = "/a/" + __uv$config.encodeUrl(url)
    activeIframe.dataset.tabUrl = url
    input.value = url
    console.log(activeIframe.dataset.tabUrl)
  }
  function isUrl(val = "") {
    if (/^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ")) {
      return true
    }
    return false
  }
  function prependHttps(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url
    }
    return url
  }
})
document.addEventListener("DOMContentLoaded", function (event) {
  const addTabButton = document.getElementById("add-tab")
  const tabList = document.getElementById("tab-list")
  const iframeContainer = document.getElementById("iframe-container")
  let tabCounter = 1
  addTabButton.addEventListener("click", () => {
    createNewTab()
    Load()
  })
  function createNewTab() {
    const newTab = document.createElement("li")
    const tabTitle = document.createElement("span")
    const newIframe = document.createElement("iframe")
    newIframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-modals allow-orientation-lock"
    // When Top Navigation is not allowed links with the "top" value will be entirely blocked, if we allow Top Navigation it will overwrite the tab, which is obviously not wanted.
    tabTitle.textContent = `New Tab ${tabCounter}`
    tabTitle.className = "tab-title"
    newTab.dataset.tabId = tabCounter
    newTab.addEventListener("click", switchTab)
    newTab.setAttribute("draggable", true)
    const closeButton = document.createElement("button")
    closeButton.classList.add("close-tab")
    closeButton.innerHTML = "&#10005;"
    closeButton.addEventListener("click", closeTab)
    newTab.appendChild(tabTitle)
    newTab.appendChild(closeButton)
    tabList.appendChild(newTab)
    const allTabs = Array.from(tabList.querySelectorAll("li"))
    allTabs.forEach((tab) => tab.classList.remove("active"))
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
    allIframes.forEach((iframe) => iframe.classList.remove("active"))
    newTab.classList.add("active")
    newIframe.dataset.tabId = tabCounter
    newIframe.classList.add("active")
    newIframe.addEventListener("load", () => {
      const title = newIframe.contentDocument.title
      if (title.length <= 1) {
        tabTitle.textContent = ""
      } else {
        tabTitle.textContent = title
      }
      newIframe.contentWindow.open = function (url) {
        sessionStorage.setItem("URL", "/a/" + __uv$config.encodeUrl(url))
        createNewTab()
        return null
      }
      if (newIframe.contentDocument.documentElement.outerHTML.trim().length > 0) {
        Load()
      }
      Load()
    })
    const GoURL = sessionStorage.getItem("GoUrl")
    const URL = sessionStorage.getItem("URL")

    if (tabCounter === 0 || tabCounter === 1) {
      if (GoURL !== null) {
        if (GoURL.includes("/e/")) {
          newIframe.src = window.location.origin + GoURL
        } else {
          newIframe.src = window.location.origin + "/a/" + GoURL
        }
      } else {
        newIframe.src = "/"
      }
    } else if (tabCounter > 1) {
      if (URL !== null) {
        newIframe.src = window.location.origin + URL
        sessionStorage.removeItem("URL")
      } else if (GoURL !== null) {
        if (GoURL.includes("/e/")) {
          newIframe.src = window.location.origin + GoURL
        } else {
          newIframe.src = window.location.origin + "/a/" + GoURL
        }
      } else {
        newIframe.src = "/"
      }
    }

    iframeContainer.appendChild(newIframe)
    tabCounter += 1
  }
  function closeTab(event) {
    event.stopPropagation()
    const tabId = event.target.closest("li").dataset.tabId
    const tabToRemove = tabList.querySelector(`[data-tab-id='${tabId}']`)
    const iframeToRemove = iframeContainer.querySelector(`[data-tab-id='${tabId}']`)
    if (tabToRemove && iframeToRemove) {
      tabToRemove.remove()
      iframeToRemove.remove()
      const remainingTabs = Array.from(tabList.querySelectorAll("li"))
      if (remainingTabs.length === 0) {
        tabCounter = 0
        document.getElementById("is").value = ""
      } else {
        const nextTabIndex = remainingTabs.findIndex((tab) => tab.dataset.tabId !== tabId)
        if (nextTabIndex > -1) {
          const nextTabToActivate = remainingTabs[nextTabIndex]
          const nextIframeToActivate = iframeContainer.querySelector(`[data-tab-id='${nextTabToActivate.dataset.tabId}']`)
          remainingTabs.forEach((tab) => tab.classList.remove("active"))
          remainingTabs[nextTabIndex].classList.add("active")
          const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
          allIframes.forEach((iframe) => iframe.classList.remove("active"))
          nextIframeToActivate.classList.add("active")
        }
      }
    }
  }
  function switchTab(event) {
    const tabId = event.target.closest("li").dataset.tabId
    const allTabs = Array.from(tabList.querySelectorAll("li"))
    allTabs.forEach((tab) => tab.classList.remove("active"))
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"))
    allIframes.forEach((iframe) => iframe.classList.remove("active"))
    const selectedTab = tabList.querySelector(`[data-tab-id='${tabId}']`)
    if (selectedTab) {
      selectedTab.classList.add("active")
      Load()
    } else {
      console.log("No selected tab found with ID:", tabId)
    }
    const selectedIframe = iframeContainer.querySelector(`[data-tab-id='${tabId}']`)
    if (selectedIframe) {
      selectedIframe.classList.add("active")
    } else {
      console.log("No selected iframe found with ID:", tabId)
    }
  }
  let dragTab = null
  tabList.addEventListener("dragstart", (event) => {
    dragTab = event.target
  })
  tabList.addEventListener("dragover", (event) => {
    event.preventDefault()
    const targetTab = event.target
    if (targetTab.tagName === "LI" && targetTab !== dragTab) {
      const targetIndex = Array.from(tabList.children).indexOf(targetTab)
      const dragIndex = Array.from(tabList.children).indexOf(dragTab)
      if (targetIndex < dragIndex) {
        tabList.insertBefore(dragTab, targetTab)
      } else {
        tabList.insertBefore(dragTab, targetTab.nextSibling)
      }
    }
  })
  tabList.addEventListener("dragend", () => {
    dragTab = null
  })
  createNewTab()
})
// Reload
function reload() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}
// Popout
function popout() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    const newWindow = window.open("about:blank", "_blank")
    if (newWindow) {
      const name = localStorage.getItem("name") || "My Drive - Google Drive"
      const icon = localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
      newWindow.document.title = name
      const link = newWindow.document.createElement("link")
      link.rel = "icon"
      link.href = encodeURI(icon)
      newWindow.document.head.appendChild(link)

      const newIframe = newWindow.document.createElement("iframe")
      const style = newIframe.style
      style.position = "fixed"
      style.top = style.bottom = style.left = style.right = 0
      style.border = style.outline = "none"
      style.width = style.height = "100%"

      newIframe.src = activeIframe.src

      newWindow.document.body.appendChild(newIframe)
    }
  } else {
    console.error("No active iframe found")
  }
}

function erudaToggle() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (!activeIframe) {
    console.error("No active iframe found")
    return
  }
  const erudaWindow = activeIframe.contentWindow
  if (!erudaWindow) {
    console.error("No content window found for the active iframe")
    return
  }
  if (erudaWindow.eruda) {
    if (erudaWindow.eruda._isInit) {
      erudaWindow.eruda.destroy()
    } else {
      console.error("Eruda is not initialized in the active iframe")
    }
  } else {
    const erudaDocument = activeIframe.contentDocument
    if (!erudaDocument) {
      console.error("No content document found for the active iframe")
      return
    }
    const script = erudaDocument.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/eruda"
    script.onload = function () {
      if (!erudaWindow.eruda) {
        console.error("Failed to load Eruda in the active iframe")
        return
      }
      erudaWindow.eruda.init()
      erudaWindow.eruda.show()
    }
    erudaDocument.head.appendChild(script)
  }
}
// Fullscreen
function FS() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    if (!activeIframe.contentDocument.fullscreenElement) {
      activeIframe.contentDocument.documentElement.requestFullscreen()
    } else {
      activeIframe.contentDocument.exitFullscreen()
    }
  } else {
    console.error("No active iframe found")
  }
}
const fullscreenButton = document.getElementById("fullscreen-button")
fullscreenButton.addEventListener("click", FS)
// Home
function Home() {
  window.location.href = "./"
}
const homeButton = document.getElementById("home-page")
homeButton.addEventListener("click", Home)
// Back
function goBack() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.contentWindow.history.back()
    iframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}
// Forward
function goForward() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe) {
    activeIframe.contentWindow.history.forward()
    iframe.src = activeIframe.src
    Load()
  } else {
    console.error("No active iframe found")
  }
}
// Remove Nav
document.addEventListener("DOMContentLoaded", function () {
  const TB = document.getElementById("tabs-button")
  const NB = document.getElementById("right-side-nav")
  TB.addEventListener("click", function () {
    const activeIframe = document.querySelector("#iframe-container iframe.active")
    if (NB.style.display === "none") {
      NB.style.display = ""
      activeIframe.style.top = "10%"
      activeIframe.style.height = "90%"
      TB.querySelector("i").classList.remove("fa-magnifying-glass-plus")
      TB.querySelector("i").classList.add("fa-magnifying-glass-minus")
    } else {
      NB.style.display = "none"
      activeIframe.style.top = "5%"
      activeIframe.style.height = "95%"
      TB.querySelector("i").classList.remove("fa-magnifying-glass-minus")
      TB.querySelector("i").classList.add("fa-magnifying-glass-plus")
    }
  })
})
if (navigator.userAgent.includes("Chrome")) {
  window.addEventListener("resize", function () {
    navigator.keyboard.lock(["Escape"])
  })
}
function Load() {
  const activeIframe = document.querySelector("#iframe-container iframe.active")
  if (activeIframe && activeIframe.contentWindow.document.readyState === "complete") {
    const website = activeIframe.contentWindow.document.location.href
    if (website.includes("/a/")) {
      const websitePath = website.replace(window.location.origin, "").replace("/a/", "")
      localStorage.setItem("decoded", websitePath)
      const decodedValue = decodeXor(websitePath)
      document.getElementById("is").value = decodedValue
    } else if (website.includes("/a/q/")) {
      const websitePath = website.replace(window.location.origin, "").replace("/a/q/", "")
      const decodedValue = decodeXor(websitePath)
      localStorage.setItem("decoded", websitePath)
      document.getElementById("is").value = decodedValue
    } else {
      const websitePath = website.replace(window.location.origin, "")
      document.getElementById("is").value = websitePath
      localStorage.setItem("decoded", websitePath)
    }
  }
}
function decodeXor(input) {
  if (!input) {
    return input
  }
  let [str, ...search] = input.split("?")
  return (
    decodeURIComponent(str)
      .split("")
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(NaN) ^ 2) : char))
      .join("") + (search.length ? "?" + search.join("?") : "")
  )
}