// Global variables
let allProducts = []
let filteredProducts = []
let currentPage = 1
const productsPerPage = 8

// DOM elements
const productGrid = document.getElementById("productGrid")
const searchInput = document.getElementById("searchInput")
const categorySelect = document.getElementById("categorySelect")
const priceRange = document.getElementById("priceRange")
const priceValue = document.getElementById("priceValue")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const pageInfo = document.getElementById("pageInfo")
const themeToggle = document.getElementById("themeToggle")
const loadingSpinner = document.getElementById("loadingSpinner")

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
  await loadProducts()
  initializeTheme()
  setupEventListeners()
  setupIntersectionObserver()
  renderProducts()
})

// Load products from JSON
async function loadProducts() {
  try {
    showLoading(true)
    const response = await fetch("products.json")
    allProducts = await response.json()
    filteredProducts = [...allProducts]
    populateCategories()
    showLoading(false)
  } catch (error) {
    console.error("Error loading products:", error)
    showLoading(false)
  }
}

// Show/hide loading spinner
function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none"
  productGrid.style.display = show ? "none" : "grid"
}

// Populate category dropdown
function populateCategories() {
  const categories = [...new Set(allProducts.map((product) => product.category))]
  categorySelect.innerHTML = '<option value="">All Categories</option>'
  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category
    option.textContent = category
    categorySelect.appendChild(option)
  })
}

// Setup event listeners
function setupEventListeners() {
  // Search filter
  searchInput.addEventListener("input", debounce(applyFilters, 300))

  // Category filter
  categorySelect.addEventListener("change", applyFilters)

  // Price filter
  priceRange.addEventListener("input", (e) => {
    priceValue.textContent = e.target.value
    applyFilters()
  })

  // Pagination
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--
      renderProducts()
    }
  })

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
    if (currentPage < totalPages) {
      currentPage++
      renderProducts()
    }
  })

  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme)
}

// Debounce function for search input
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Apply filters
function applyFilters() {
  showLoading(true)

  setTimeout(() => {
    const searchTerm = searchInput.value.toLowerCase()
    const selectedCategory = categorySelect.value
    const maxPrice = Number.parseInt(priceRange.value)

    filteredProducts = allProducts.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm)
      const matchesCategory = !selectedCategory || product.category === selectedCategory
      const matchesPrice = product.price <= maxPrice

      return matchesSearch && matchesCategory && matchesPrice
    })

    currentPage = 1
    renderProducts()
    showLoading(false)
  }, 500)
}

// Render products
function renderProducts() {
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const productsToShow = filteredProducts.slice(startIndex, endIndex)

  productGrid.innerHTML = ""

  productsToShow.forEach((product, index) => {
    const productCard = createProductCard(product)
    productCard.style.animationDelay = `${index * 0.1}s`
    productGrid.appendChild(productCard)
  })

  updatePagination()

  // Scroll to top of products
  productGrid.scrollIntoView({ behavior: "smooth", block: "start" })
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div")
  card.className = "product-card"
  card.innerHTML = `
        <img  class="product-image lazy-image" data-src="${product.image}" alt="${product.title}" loading="lazy" style="height:250 ; width:300 ;">
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-owner">${product.owner}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        </div>
    `
  return card
}

// Update pagination controls
function updatePagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  prevBtn.disabled = currentPage === 1
  nextBtn.disabled = currentPage === totalPages || totalPages === 0

  pageInfo.textContent = totalPages === 0 ? "No products found" : `Page ${currentPage} of ${totalPages}`
}

// Intersection Observer for lazy loading and animations
function setupIntersectionObserver() {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.classList.remove("lazy-image")
        imageObserver.unobserve(img)
      }
    })
  })

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running"
        }
      })
    },
    { threshold: 0.1 },
  )

  // Observe images and cards when they're added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const images = node.querySelectorAll(".lazy-image")
          const cards = node.querySelectorAll(".product-card")

          images.forEach((img) => imageObserver.observe(img))
          cards.forEach((card) => cardObserver.observe(card))
        }
      })
    })
  })

  observer.observe(productGrid, { childList: true })
}

// Theme management
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark"
  document.documentElement.setAttribute("data-theme", savedTheme)
  updateThemeIcon(savedTheme)
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme")
  const newTheme = currentTheme === "dark" ? "light" : "dark"

  document.documentElement.setAttribute("data-theme", newTheme)
  localStorage.setItem("theme", newTheme)
  updateThemeIcon(newTheme)
}

function updateThemeIcon(theme) {
  const themeIcon = document.querySelector(".theme-icon")
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙"
}
