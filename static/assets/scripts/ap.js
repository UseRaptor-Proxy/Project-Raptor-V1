let appInd
let g = window.location.pathname === "/gm"
let a = window.location.pathname === "/as"
let c = window.location.pathname === "/ts"
let t = window.top.location.pathname === "/ta"

function saveToLocal(path) {
  sessionStorage.setItem("GoUrl", path)
}

function handleClick(app) {
  if (typeof app.say !== "undefined") {
    alert(app.say)
  }

  let Selected = app.link
  if (app.links && app.links.length > 1) {
    Selected = getSelected(app.links)
    if (!Selected) {
      return false
    }
  }

  if (app.local) {
    saveToLocal(Selected)
    window.location.href = "ta"
    if (t) {
      window.location.href = Selected
    }
  } else if (app.local2) {
    saveToLocal(Selected)
    window.location.href = Selected
  } else if (app.blank) {
    blank(Selected)
  } else if (app.now) {
    now(Selected)
    if (t) {
      window.location.href = Selected
    }
  } else if (app.custom) {
    Custom(app)
  } else if (app.dy) {
    dy(Selected)
  } else {
    go(Selected)
    if (t) {
      blank(Selected)
    }
  }
  return false
}

function getSelected(links) {
  let options = links.map((link, index) => `${index + 1}: ${link.name}`).join("\n")
  let choice = prompt(`Select a link by entering the corresponding number:\n${options}`)
  let selectedIndex = parseInt(choice, 10) - 1

  if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= links.length) {
    alert("Invalid selection. Please try again.")
    return null
  }

  return links[selectedIndex].url
}

function CustomApp(customApp) {
  let apps
  if (g) {
    apps = localStorage.getItem("Gcustom")
  } else if (c) {
    apps = localStorage.getItem("Tcustom")
  } else if (a) {
    apps = localStorage.getItem("Acustom")
  }

  if (apps === null) {
    apps = {}
  } else {
    apps = JSON.parse(apps)
  }

  const key = "custom" + (Object.keys(apps).length + 1)

  apps[key] = customApp

  if (g) {
    localStorage.setItem("Gcustom", JSON.stringify(apps))
  } else if (c) {
    localStorage.setItem("Tcustom", JSON.stringify(apps))
  } else if (a) {
    localStorage.setItem("Acustom", JSON.stringify(apps))
  }
}

function setPin(index) {
  let pins
  if (g) {
    pins = localStorage.getItem("Gpinned")
  } else if (c) {
    pins = localStorage.getItem("Tpinned")
  } else if (a) {
    pins = localStorage.getItem("Apinned")
  }

  if (pins === null || pins === "") {
    pins = []
  } else {
    pins = pins.split(",").map(Number)
  }
  if (pinContains(index, pins)) {
    let remove = pins.indexOf(index)
    pins.splice(remove, 1)
  } else {
    pins.push(index)
  }
  if (g) {
    localStorage.setItem("Gpinned", pins)
  } else if (c) {
    localStorage.setItem("Tpinned", pins)
  } else if (a) {
    localStorage.setItem("Apinned", pins)
  }
  location.reload()
}

function pinContains(i, p) {
  if (p == "") {
    return false
  }
  for (var x = 0; x < p.length; x += 1) {
    if (p[x] === i) {
      return true
    }
  }
  return false
}

function Custom(app) {
  const title = prompt("Enter title for the app:")
  const link = prompt("Enter link for the app:")
  if (title && link) {
    const customApp = {
      name: "[Custom] " + title,
      link: link,
      image: "/assets/media/icons/custom.webp",
      custom: false,
    }

    CustomApp(customApp)
    initializeCustomApp(customApp)
  }
}

function initializeCustomApp(customApp) {
  const columnDiv = document.createElement("div")
  columnDiv.classList.add("column")
  columnDiv.setAttribute("data-category", "all")

  const pinIcon = document.createElement("i")
  pinIcon.classList.add("fa", "fa-map-pin")
  pinIcon.ariaHidden = true

  const btn = document.createElement("button")
  btn.appendChild(pinIcon)
  btn.style.float = "right"
  btn.style.backgroundColor = "rgb(45,45,45)"
  btn.style.borderRadius = "50%"
  btn.style.borderColor = "transparent"
  btn.style.color = "white"
  btn.style.top = "-200px"
  btn.style.position = "relative"
  btn.onclick = function () {
    setPin(appInd)
  }
  btn.title = "Pin"

  const linkElem = document.createElement("a")
  linkElem.onclick = function () {
    handleClick(customApp)
  }

  const image = document.createElement("img")
  image.width = 145
  image.height = 145
  image.src = customApp.image
  image.loading = "lazy"

  const paragraph = document.createElement("p")
  paragraph.textContent = customApp.name

  linkElem.appendChild(image)
  linkElem.appendChild(paragraph)
  columnDiv.appendChild(linkElem)
  columnDiv.appendChild(btn)

  const nonPinnedApps = document.querySelector(".container-apps")
  nonPinnedApps.insertBefore(columnDiv, nonPinnedApps.firstChild)
}

document.addEventListener("DOMContentLoaded", () => {
  let storedApps
  if (g) {
    storedApps = JSON.parse(localStorage.getItem("Gcustom"))
  } else if (c) {
    storedApps = JSON.parse(localStorage.getItem("Tcustom"))
  } else if (a) {
    storedApps = JSON.parse(localStorage.getItem("Acustom"))
  }
  if (storedApps) {
    Object.values(storedApps).forEach((app) => {
      initializeCustomApp(app)
    })
  }
})

let path = "/assets/json/a.min.json"
if (g) {
  path = "/assets/json/g.min.json"
} else if (c) {
  path = "/assets/json/t.min.json"
} else if (a) {
  path = "/assets/json/a.min.json"
}
fetch(path)
  .then((response) => {
    return response.json()
  })
  .then((appsList) => {
    appsList.sort((a, b) => {
      if (a.name.startsWith("[Custom]")) {
        return -1
      }
      if (b.name.startsWith("[Custom]")) {
        return 1
      }
      return a.name.localeCompare(b.name)
    })
    const nonPinnedApps = document.querySelector(".container-apps")
    const pinnedApps = document.querySelector(".pinned-apps")
    if (g) {
      var pinList = localStorage.getItem("Gpinned") || ""
    } else if (a) {
      var pinList = localStorage.getItem("Apinned") || ""
    } else if (c) {
      var pinList = localStorage.getItem("Tpinned") || ""
    }
    pinList = pinList ? pinList.split(",").map(Number) : []
    appInd = 0

    appsList.forEach((app) => {
      if (app.categories && app.categories.includes("local")) {
        app.local = true
      } else if (app.link && (app.link.includes("now.gg") || app.link.includes("nowgg.me"))) {
        if (app.partial === null || app.partial === undefined) {
          app.partial = true
          app.say = "Now.gg is currently not working for some users."
        }
      } else if (app.link && app.link.includes("nowgg.nl")) {
        if (app.error === null || app.error === undefined) {
          app.error = true
          app.say = "NowGG.nl is currently down."
        }
      }

      let pinNum = appInd

      const columnDiv = document.createElement("div")
      columnDiv.classList.add("column")
      columnDiv.setAttribute("data-category", app.categories.join(" "))

      const pinIcon = document.createElement("i")
      pinIcon.classList.add("fa", "fa-map-pin")
      pinIcon.ariaHidden = true

      const btn = document.createElement("button")
      btn.appendChild(pinIcon)
      btn.style.float = "right"
      btn.style.backgroundColor = "rgb(45,45,45)"
      btn.style.borderRadius = "50%"
      btn.style.borderColor = "transparent"
      btn.style.color = "white"
      btn.style.top = "-200px"
      btn.style.position = "relative"
      btn.onclick = function () {
        setPin(pinNum)
      }
      btn.title = "Pin"

      const link = document.createElement("a")

      link.onclick = function () {
        handleClick(app)
      }

      const image = document.createElement("img")
      image.width = 145
      image.height = 145
      image.loading = "lazy"

      if (app.image) {
        image.src = app.image
      } else {
        image.style.display = "none"
      }

      const paragraph = document.createElement("p")
      paragraph.textContent = app.name

      if (app.error) {
        paragraph.style.color = "red"
        if (!app.say) {
          app.say = "This app is currently not working."
        }
      } else if (app.load) {
        paragraph.style.color = "yellow"
        if (!app.say) {
          app.say = "This app may experience excessive loading times."
        }
      } else if (app.partial) {
        paragraph.style.color = "yellow"
        if (!app.say) {
          app.say = "This app is currently experiencing some issues, it may not work for you. (Dynamic doesn't work in about:blank)"
        }
      }

      link.appendChild(image)
      link.appendChild(paragraph)
      columnDiv.appendChild(link)

      if (appInd != 0) {
        columnDiv.appendChild(btn)
      }

      if (pinList != null && appInd != 0) {
        if (pinContains(appInd, pinList)) {
          pinnedApps.appendChild(columnDiv)
        } else {
          nonPinnedApps.appendChild(columnDiv)
        }
      } else {
        nonPinnedApps.appendChild(columnDiv)
      }
      appInd += 1
    })

    const appsContainer = document.getElementById("apps-container")
    appsContainer.appendChild(pinnedApps)
    appsContainer.appendChild(nonPinnedApps)
  })
  .catch((error) => {
    console.error("Error fetching JSON data:", error)
  })

function show_category() {
  var selectedCategories = Array.from(document.querySelectorAll("#category option:checked")).map((option) => option.value)
  var games = document.getElementsByClassName("column")

  for (var i = 0; i < games.length; i += 1) {
    var game = games[i]
    var categories = game.getAttribute("data-category").split(" ")

    if (selectedCategories.length === 0 || selectedCategories.some((category) => categories.includes(category))) {
      game.style.display = "block"
    } else {
      game.style.display = "none"
    }
  }
}

function search_bar() {
  var input = document.getElementById("searchbarbottom")
  var filter = input.value.toLowerCase()
  var games = document.getElementsByClassName("column")

  for (var i = 0; i < games.length; i += 1) {
    var game = games[i]
    var name = game.getElementsByTagName("p")[0].textContent.toLowerCase()

    if (name.includes(filter)) {
      game.style.display = "block"
    } else {
      game.style.display = "none"
    }
  }
}