import './browse.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import ItemCard from './ItemCard'
import Pagination from './Pagination'
import SkeletonGrid from './SkeletonGrid'
import EmptyState from './EmptyState'
import Brand from '../components/Brand'
import { Search, User, LogOut, Menu, X, SlidersHorizontal } from 'lucide-react'
import NavChatDropdown from '../components/NavChatDropdown'
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'
const PAGE_SIZE = 9

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Lost', value: 'lost' },
  { label: 'Found', value: 'found' },
  { label: 'Claimed', value: 'claimed' },
]

const CATEGORY_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'ID', value: 'id' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Other', value: 'other' },
]

function getStoredToken() {
  return localStorage.getItem('kyurToken')
}

export default function BrowseItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 })
  const [draftSearch, setDraftSearch] = useState(searchParams.get('search') || '')
  const [locationDraft, setLocationDraft] = useState(searchParams.get('locationId') || '')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const isLoggedIn = !!getStoredToken()

  const filters = useMemo(
    () => ({
      status: searchParams.get('status') || '',
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      locationId: searchParams.get('locationId') || '',
      page: Number(searchParams.get('page') || 1),
    }),
    [searchParams],
  )

  const updateFilters = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams)

      Object.entries(updates).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
      })

      if (!Object.hasOwn(updates, 'page')) {
        next.delete('page')
      }

      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  useEffect(() => {
    const controller = new AbortController()
    const token = getStoredToken()

    async function loadItems() {
      setIsLoading(true)
      setError('')

      try {
        const params = {
          page: filters.page,
          limit: PAGE_SIZE,
        }

        if (filters.status) params.status = filters.status
        if (filters.category) params.category = filters.category
        if (filters.search) params.search = filters.search
        if (filters.locationId) params.locationId = filters.locationId

        const response = await axios.get(`${API_BASE_URL}/items/getItems`, {
          params,
          ...(token && { headers: { Authorization: `Bearer ${token}` } }),
        })

        setItems(response.data.data.items);
        setMeta({
          page: response.data.data.page,
          pages: response.data.data.pages,
          total: response.data.data.total,
        });
      } catch (err) {
        if (axios.isCancel(err)) return
        setError('Unable to load items right now.')
        setItems([])
        setMeta({ page: 1, pages: 1, total: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
    return () => controller.abort()
  }, [filters])

  const submitSearch = (event) => {
    event.preventDefault()
    updateFilters({
      search: draftSearch.trim(),
      locationId: locationDraft.trim(),
    })
  }

  const activeFilterCount = [
    filters.status,
    filters.category,
    filters.search,
    filters.locationId,
  ].filter(Boolean).length

  return (
    <>
    <main className="app-shell">
      {/* Dynamic Header */}
      <header className="kyurNav" style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <Link to="/" className="brandLink" style={{ flexShrink: 0, marginRight: 8 }} onClick={() => setMobileNavOpen(false)}>
          <Brand />
        </Link>

        <nav className="navLinks" style={{ justifyContent: "flex-start", marginRight: "auto" }}>
          <Link to="/items">Hall of Lost and Found</Link>
          {isLoggedIn && <Link to="/profile">Management</Link>}
          <Link to="/about">About</Link>
        </nav>

        {/* Global Search Bar */}
        <form className="navSearch" onSubmit={submitSearch}>
          <button type="submit" style={{ background: 'none', border: 'none', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
          <input
            type="search"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Search for an item"
          />
        </form>

        <div className="navActions">
          {isLoggedIn ? (
            <>
              <Link className="reportBtn" to="/items/report">Report Lost Item</Link>
              <NavChatDropdown />
              <button
                onClick={() => { localStorage.removeItem('kyurToken'); window.location.href='/login'; }}
                className="btn-secondary navIconBtn"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link className="reportBtn" to="/login">Report Lost Item</Link>
              <Link to="/login" className="btn-secondary navTextBtn">
                <User size={18} style={{ marginRight: 4 }} /> Login
              </Link>
            </>
          )}
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileNavOpen}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {mobileNavOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMobileNavOpen(false)}>
          <nav className="mobile-nav-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-links">
              <Link to="/items" onClick={() => setMobileNavOpen(false)}>Hall of Lost and Found</Link>
              {isLoggedIn && <Link to="/profile" onClick={() => setMobileNavOpen(false)}>Management</Link>}
              <Link to="/about" onClick={() => setMobileNavOpen(false)}>About</Link>
            </div>
            <hr className="mobile-nav-divider" />
            <div className="mobile-nav-actions">
              {isLoggedIn ? (
                <>
                  <Link className="reportBtn mobile-full-btn" to="/items/report" onClick={() => setMobileNavOpen(false)}>
                    Report Lost Item
                  </Link>
                  <button
                    onClick={() => { localStorage.removeItem('kyurToken'); window.location.href='/login'; }}
                    className="btn-secondary mobile-full-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link className="reportBtn mobile-full-btn" to="/login" onClick={() => setMobileNavOpen(false)}>
                    Report Lost Item
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary mobile-full-btn"
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <User size={18} /> Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <div className="custom-scroll-container">
        {/* Main Browse Hero */}
        <section className="feed-header">
          <div>
            <p className="eyebrow">Campus item recovery</p>
            <h1>Search for an item</h1>
            <p className="page-copy">
              Browse reported lost and found belongings across PUP locations.
            </p>
          </div>
        </section>

        {/* Mobile filter toggle bar */}
        <div className="mobile-filter-bar">
          <button
            type="button"
            className={`mobile-filter-toggle ${activeFilterCount > 0 ? 'has-filters' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal size={16} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <span className="mobile-results-count">
            {isLoading ? 'Loading…' : `${meta.total} item${meta.total === 1 ? '' : 's'}`}
          </span>
        </div>

      {/* Layout Content */}
      <section className="browse-layout" aria-label="Browse reported items">
        <aside className={`filters-panel ${filtersOpen ? 'mobile-open' : ''}`}>
          <div className="panel-title">
            {/* Lucide Filter Icon */}
            <svg
              className="lucide-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
              style={{ marginRight: '6px' }}
            >
              <path d="M3 6h18" />
              <path d="M7 12h10" />
              <path d="M10 18h4" />
            </svg>
            <span>Filters</span>
            {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
          </div>

          <form className="filter-form" onSubmit={submitSearch}>
            <label className="field-label" htmlFor="item-search">
              Title
            </label>
            <div className="search-field">
              {/* Lucide Search Icon */}
              <svg
                className="lucide-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="item-search"
                className="text-input"
                type="search"
                value={draftSearch}
                onChange={(event) => setDraftSearch(event.target.value)}
                placeholder="Title"
              />
            </div>

            <label className="field-label" htmlFor="location-id">
              Location ID
            </label>
            <input
              id="location-id"
              className="text-input"
              type="text"
              value={locationDraft}
              onChange={(event) => setLocationDraft(event.target.value)}
              placeholder="QR-MAIN-S502"
            />

            <button className="secondary-action" type="submit">
              Apply Search
            </button>
          </form>

          <div className="filter-group">
            <span className="field-label">Status</span>
            <div className="segmented" role="group" aria-label="Filter by status">
              {STATUS_OPTIONS.map((option) => (
                <button
                  className={filters.status === option.value ? 'active' : ''}
                  key={option.value || 'all-status'}
                  type="button"
                  onClick={() => updateFilters({ status: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="field-label">Category</span>
            <div className="category-pills" role="group" aria-label="Filter by category">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  className={filters.category === option.value ? 'active' : ''}
                  key={option.value || 'all-category'}
                  type="button"
                  onClick={() => updateFilters({ category: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              className="clear-filters"
              type="button"
              onClick={() => {
                setDraftSearch('')
                setLocationDraft('')
                setSearchParams({})
              }}
            >
              Clear filters
            </button>
          )}

          <button
            type="button"
            className="mobile-filter-close"
            onClick={() => setFiltersOpen(false)}
          >
            Apply &amp; Close
          </button>
        </aside>

        <section className="results-panel">
          <div className="results-toolbar">
            <div>
              <strong>
                {isLoading ? 'Loading items' : `${meta.total} item${meta.total === 1 ? '' : 's'}`}
              </strong>
              <span>
                Page {meta.page} of {Math.max(meta.pages, 1)}
              </span>
            </div>
          </div>

          {error && <div className="alert" role="alert">{error}</div>}

          {isLoading ? (
            <SkeletonGrid />
          ) : items.length > 0 ? (
            <>
              <div className="item-grid">
                {items.map((item) => (
                  <ItemCard item={item} key={item._id} />
                ))}
              </div>
              
              <Pagination
                currentPage={meta.page}
                totalPages={Math.max(meta.pages, 1)}
                onPageChange={(page) => updateFilters({ page })}
              />
            </>
          ) : (
            <EmptyState />
          )}
        </section>
      </section>
      </div>
    </main>
    </>
  )
}
