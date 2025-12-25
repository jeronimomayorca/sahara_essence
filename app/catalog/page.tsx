"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Perfume } from "@/lib/types"
import { getPerfumeImageUrl } from "@/lib/utils"

// Hook de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// Función de ordenamiento
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'brand-asc' | 'brand-desc'

const sortPerfumes = (perfumes: Perfume[], sortBy: SortOption): Perfume[] => {
  const sorted = [...perfumes]
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'brand-asc':
      return sorted.sort((a, b) => a.brand.localeCompare(b.brand))
    case 'brand-desc':
      return sorted.sort((a, b) => b.brand.localeCompare(a.brand))
    default:
      return sorted
  }
}

function CatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize state from URL search params or use defaults
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '')
  const [selectedBrand, setSelectedBrand] = useState(() => searchParams.get('brand') || 'Todas')
  const [selectedGender, setSelectedGender] = useState(() => searchParams.get('gender') || 'Todos')
  const [selectedFamily, setSelectedFamily] = useState(() => searchParams.get('family') || 'Todas')
  const [selectedConcentration, setSelectedConcentration] = useState(() => searchParams.get('concentration') || 'Todas')
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'name-asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [perfumes, setPerfumes] = useState<Perfume[]>([])

  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  // Update URL when search or filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (selectedBrand !== 'Todas') params.set('brand', selectedBrand)
    if (selectedGender !== 'Todos') params.set('gender', selectedGender)
    if (selectedFamily !== 'Todas') params.set('family', selectedFamily)
    if (selectedConcentration !== 'Todas') params.set('concentration', selectedConcentration)
    if (sortBy !== 'name-asc') params.set('sort', sortBy)

    // Use replace instead of push to avoid adding to browser history for each change
    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : '/catalog'
    window.history.replaceState({}, '', newUrl)
  }, [searchTerm, selectedBrand, selectedGender, selectedFamily, selectedConcentration, sortBy])

  // Cargar perfumes desde Supabase
  useEffect(() => {
    async function loadPerfumes() {
      try {
        const { data, error } = await supabase
          .from('perfumes')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error loading perfumes:', error)
          setPerfumes([])
        } else {
          setPerfumes(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setPerfumes([])
      }
    }

    loadPerfumes()
  }, [])

  // Memoizar los arrays de filtros
  const brands = useMemo(() => [
    "Todas",
    ...Array.from(new Set(perfumes.map((p) => p.brand)))
  ], [perfumes])
  const genders = useMemo(() => [
    "Todos",
    ...Array.from(new Set(perfumes.map((p) => p.gender)))
  ], [perfumes])
  const families = useMemo(() => [
    "Todas",
    ...Array.from(new Set(perfumes.map((p) => p.family)))
  ], [perfumes])
  
  const concentrations = useMemo(() => [
    "Todas",
    ...Array.from(new Set(perfumes.map((p) => p.concentration).filter((c): c is string => c !== undefined && c !== null)))
  ], [perfumes])

  const filteredPerfumes = useMemo(() => {
    return perfumes.filter((perfume) => {
      const matchesSearch =
        perfume.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        perfume.brand.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      const matchesBrand = selectedBrand === "Todas" || perfume.brand === selectedBrand
      const matchesGender = selectedGender === "Todos" || perfume.gender === selectedGender
      const matchesFamily = selectedFamily === "Todas" || perfume.family === selectedFamily
      const matchesConcentration = selectedConcentration === "Todas" || perfume.concentration === selectedConcentration

      return matchesSearch && matchesBrand && matchesGender && matchesFamily && matchesConcentration
    })
  }, [debouncedSearchTerm, selectedBrand, selectedGender, selectedFamily, selectedConcentration, perfumes])

  // Ordenar perfumes de manera consistente
  const sortedPerfumes = useMemo(() => sortPerfumes(filteredPerfumes, sortBy), [filteredPerfumes, sortBy])

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const perfumesPerPage = 12
  const totalPages = Math.ceil(sortedPerfumes.length / perfumesPerPage)
  const paginatedPerfumes = useMemo(() => {
    const start = (currentPage - 1) * perfumesPerPage
    return sortedPerfumes.slice(start, start + perfumesPerPage)
  }, [sortedPerfumes, currentPage])

  // Resetear página al cambiar filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, selectedBrand, selectedGender, selectedFamily, selectedConcentration])

  const clearFilters = () => {
    setSelectedBrand("Todas")
    setSelectedGender("Todos")
    setSelectedFamily("Todas")
    setSelectedConcentration("Todas")
    setSearchTerm("")
    setSortBy('name-asc')
    // Clear URL parameters when clearing filters
    window.history.replaceState({}, '', '/catalog')
  }

  const activeFiltersCount =
    [selectedBrand, selectedGender, selectedFamily, selectedConcentration].filter((filter) => filter !== "Todas" && filter !== "Todos")
      .length + (searchTerm ? 1 : 0)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">


            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar perfumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 md:h-12 text-sm md:text-base bg-muted/50 border-none rounded-xl"
              />
            </div>

            <div className="flex items-center justify-center">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden relative bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                    <SheetDescription>Refina tu búsqueda de perfumes</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="font-inter font-medium text-sm mb-2 block">Familia Olfativa</label>
                      <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="bottom" align="start">
                          {families.map((family) => (
                            <SelectItem key={family} value={family}>
                              {family}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-inter font-medium text-sm mb-2 block">Marca</label>
                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-inter font-medium text-sm mb-2 block">Género</label>
                      <Select value={selectedGender} onValueChange={setSelectedGender}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {genders.map((gender) => (
                            <SelectItem key={gender} value={gender}>
                              {gender}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="font-inter font-medium text-sm mb-2 block">Concentración del perfume</label>
                      <Select value={selectedConcentration} onValueChange={setSelectedConcentration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {concentrations.map((concentration) => (
                            <SelectItem key={concentration} value={concentration}>
                              {concentration}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {activeFiltersCount > 0 && (
                      <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Limpiar Filtros
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-3 flex-wrap justify-between">
              <span className="font-cormorant">Filtrar por:</span>
              <h2 className="font-cormorant text-lg text-emerald-600 dark:text-emerald-400">Marca</h2>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <h2 className="font-cormorant text-lg text-emerald-600 dark:text-emerald-400">Genero</h2>
              <Select value={selectedGender} onValueChange={setSelectedGender}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <h2 className="font-cormorant text-lg text-emerald-600 dark:text-emerald-400">Familia Olfativa</h2>
              <Select value={selectedFamily} onValueChange={setSelectedFamily}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Familia Olfativa" />
                </SelectTrigger>
                <SelectContent side="bottom">
                  {families.map((family) => (
                    <SelectItem key={family} value={family}>
                      {family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <h2 className="font-cormorant text-lg text-emerald-600 dark:text-emerald-400">Concentración</h2>
              <Select value={selectedConcentration} onValueChange={setSelectedConcentration}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Concentración" />
                </SelectTrigger>
                <SelectContent>
                  {concentrations.map((concentration) => (
                    <SelectItem key={concentration} value={concentration}>
                      {concentration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Limpiar ({activeFiltersCount})
                </Button>
              )}


              {/* Results Count */}
              <p className="font-inter text-sm text-muted-foreground text-end">
                {filteredPerfumes.length} perfume{filteredPerfumes.length !== 1 ? "s" : ""} encontrado
                {filteredPerfumes.length !== 1 ? "s" : ""}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {paginatedPerfumes.map((perfume) => (
              <motion.div
                key={perfume.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Link href={`/catalog/${perfume.id}`}>
                  <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/3] overflow-hidden">
                        <Image
                          src={getPerfumeImageUrl(perfume.image)}
                          alt={perfume.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority={perfumes.indexOf(perfume) < 4}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {(() => {
                                let notesArr: string[] = [];
                                if (Array.isArray(perfume.notes)) {
                                  notesArr = perfume.notes;
                                } else if (perfume.notes && typeof perfume.notes === 'object') {
                                  // Forzar el tipado para evitar error de TS
                                  const notesObj = perfume.notes as Record<string, string[]>;
                                  if (Array.isArray(notesObj.top)) {
                                    notesArr = notesObj.top;
                                  } else {
                                    notesArr = Object.values(notesObj).flatMap((v) => v);
                                  }
                                }
                                return notesArr.slice(0, 2).map((note, i) => (
                                  <Badge
                                    key={i}
                                    variant="secondary"
                                    className="text-xs bg-white/20 text-white border-white/30"
                                  >
                                    {note}
                                  </Badge>
                                ));
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 md:p-6">
                        <div className="mb-1 md:mb-2">
                          <Badge variant="outline" className="text-[10px] md:text-xs font-inter font-medium px-1.5 py-0 md:px-2.5 md:py-0.5">
                            {perfume.brand}
                          </Badge>
                        </div>
                        <h3 className="font-cormorant font-medium text-base md:text-xl mb-1 md:mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {perfume.name}
                        </h3>
                        <div className="flex items-center justify-between text-[10px] md:text-sm text-muted-foreground mb-1 md:mb-3">
                          <span className="font-inter">{perfume.gender}</span>
                          <span className="font-inter">{perfume.size}</span>
                        </div>
                        <p className="font-inter text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-4 line-clamp-1">{perfume.family}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-cormorant font-medium text-lg md:text-2xl text-emerald-600 dark:text-emerald-400">
                            ${perfume.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filteredPerfumes.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="font-cormorant font-medium text-2xl mb-4">No se encontraron perfumes</h3>
            <p className="font-inter text-muted-foreground mb-6">Intenta ajustar tus filtros o términos de búsqueda</p>
            <Button onClick={clearFilters} variant="outline">
              Limpiar todos los filtros
            </Button>
          </motion.div>
        )}

        {filteredPerfumes.length > perfumesPerPage && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-2 text-sm font-inter">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CatalogContent />
    </Suspense>
  )
}
