import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { regionService } from '@/api/services'
import type { Region } from '@/types'

interface HierarchicalRegionDropdownProps {
  onRegionChange: (regionId: number, regionName: string, regionType: string) => void
  accessLevel: 'TOLI_CREATION' | 'VIEW_ONLY' | null
  disabled?: boolean
  maxRegionType?: 'PRANT' | 'VIBHAG' | 'JILA' | 'NAGAR' | 'KHAND' | 'BASTI' | 'MANDAL' | 'GRAM' | null
}

interface RegionState {
  prants: Region[]
  vibhags: Region[]
  jilas: Region[]
  nagars: Region[]
  khands: Region[]
  bastis: Region[]
  mandals: Region[]
  grams: Region[]
}

interface SelectedRegions {
  prant: Region | null
  vibhag: Region | null
  jila: Region | null
  prakar: 'GRAMNIYE' | 'NAGARIYE' | null
  nagar: Region | null
  khand: Region | null
  basti: Region | null
  mandal: Region | null
  gram: Region | null
}

export default function HierarchicalRegionDropdown({ 
  onRegionChange, 
  accessLevel,
  disabled = false,
  maxRegionType = null
}: HierarchicalRegionDropdownProps) {
  const [regions, setRegions] = useState<RegionState>({
    prants: [],
    vibhags: [],
    jilas: [],
    nagars: [],
    khands: [],
    bastis: [],
    mandals: [],
    grams: []
  })

  const [selected, setSelected] = useState<SelectedRegions>({
    prant: null,
    vibhag: null,
    jila: null,
    prakar: null,
    nagar: null,
    khand: null,
    basti: null,
    mandal: null,
    gram: null
  })

  const [loading, setLoading] = useState({
    prants: false,
    vibhags: false,
    jilas: false,
    nagars: false,
    khands: false,
    bastis: false,
    mandals: false,
    grams: false
  })

  // Load initial prants
  useEffect(() => {
    loadPrants()
  }, [])


  const loadPrants = async () => {
    try {
      setLoading(prev => ({ ...prev, prants: true }))
      const response = await regionService.getRegions('PRANT')
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, prants: response.data }))
        // Auto-select Haryana if available
        const haryana = response.data.find(p => p.name.toLowerCase().includes('haryana'))
        if (haryana) {
          setSelected(prev => ({ ...prev, prant: haryana }))
          loadVibhags(haryana.code)
          onRegionChange(haryana.region_id, haryana.name, haryana.type)
        }
      }
    } catch (error) {
      console.error('Error loading prants:', error)
    } finally {
      setLoading(prev => ({ ...prev, prants: false }))
    }
  }

  const loadVibhags = async (prantCode: string) => {
    try {
      setLoading(prev => ({ ...prev, vibhags: true }))
      const response = await regionService.getRegions('VIBHAG', { prant_code: prantCode })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, vibhags: response.data }))
      }
    } catch (error) {
      console.error('Error loading vibhags:', error)
    } finally {
      setLoading(prev => ({ ...prev, vibhags: false }))
    }
  }

  const loadJilas = async (prantCode: string, vibhagCode: string) => {
    try {
      setLoading(prev => ({ ...prev, jilas: true }))
      const response = await regionService.getRegions('JILA', { 
        prant_code: prantCode,
        vibhag_code: vibhagCode 
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, jilas: response.data }))
      }
    } catch (error) {
      console.error('Error loading jilas:', error)
    } finally {
      setLoading(prev => ({ ...prev, jilas: false }))
    }
  }

  const loadNagars = async (prantCode: string, vibhagCode: string, jilaCode: string) => {
    try {
      setLoading(prev => ({ ...prev, nagars: true }))
      const response = await regionService.getRegions('NAGAR', { 
        prant_code: prantCode,
        vibhag_code: vibhagCode,
        jila_code: jilaCode 
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, nagars: response.data }))
      }
    } catch (error) {
      console.error('Error loading nagars:', error)
    } finally {
      setLoading(prev => ({ ...prev, nagars: false }))
    }
  }

  const loadKhands = async (prantCode: string, vibhagCode: string, jilaCode: string) => {
    try {
      setLoading(prev => ({ ...prev, khands: true }))
      const response = await regionService.getRegions('KHAND', { 
        prant_code: prantCode,
        vibhag_code: vibhagCode,
        jila_code: jilaCode 
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, khands: response.data }))
      }
    } catch (error) {
      console.error('Error loading khands:', error)
    } finally {
      setLoading(prev => ({ ...prev, khands: false }))
    }
  }

  // Reset dependent dropdowns
  const resetDependentDropdowns = (level: keyof SelectedRegions) => {
    const resetMap: Record<keyof SelectedRegions, (keyof SelectedRegions)[]> = {
      prant: ['vibhag', 'jila', 'prakar', 'nagar', 'khand', 'basti', 'mandal', 'gram'],
      vibhag: ['jila', 'prakar', 'nagar', 'khand', 'basti', 'mandal', 'gram'],
      jila: ['prakar', 'nagar', 'khand', 'basti', 'mandal', 'gram'],
      prakar: ['nagar', 'khand', 'basti', 'mandal', 'gram'],
      nagar: ['basti'],
      khand: ['mandal', 'gram'],
      basti: [],
      mandal: ['gram'],
      gram: []
    }

    const toReset = resetMap[level]
    setSelected(prev => {
      const newSelected = { ...prev }
      toReset.forEach(key => {
        newSelected[key] = null
      })
      return newSelected
    })

    setRegions(prev => {
      const newRegions = { ...prev }
      toReset.forEach(key => {
        if (key !== 'prakar') {
          const pluralKey = (key + 's') as keyof RegionState
          if (pluralKey in newRegions) {
            newRegions[pluralKey] = []
          }
        }
      })
      return newRegions
    })
  }

  const handlePrantChange = (value: string) => {
    const prant = regions.prants.find(p => p.region_id.toString() === value)
    if (prant) {
      setSelected(prev => ({ ...prev, prant }))
      resetDependentDropdowns('prant')
      // Only load vibhags if maxRegionType is not PRANT
      if (maxRegionType !== 'PRANT') {
        loadVibhags(prant.code)
      }
      onRegionChange(prant.region_id, prant.name, prant.type)
    }
  }

  const handleVibhagChange = (value: string) => {
    const vibhag = regions.vibhags.find(v => v.region_id.toString() === value)
    if (vibhag && selected.prant) {
      setSelected(prev => ({ ...prev, vibhag }))
      resetDependentDropdowns('vibhag')
      // Only load jilas if maxRegionType is not PRANT or VIBHAG
      if (maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG') {
        loadJilas(selected.prant.code, vibhag.code)
      }
      onRegionChange(vibhag.region_id, vibhag.name, vibhag.type)
    }
  }

  const handleJilaChange = (value: string) => {
    const jila = regions.jilas.find(j => j.region_id.toString() === value)
    if (jila && selected.prant && selected.vibhag) {
      setSelected(prev => ({ ...prev, jila }))
      resetDependentDropdowns('jila')
      // Only load Nagars and Khands if maxRegionType is not PRANT, VIBHAG, or JILA
      if (maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA') {
        loadNagars(selected.prant.code, selected.vibhag.code, jila.code)
        loadKhands(selected.prant.code, selected.vibhag.code, jila.code)
      }
      onRegionChange(jila.region_id, jila.name, jila.type)
    }
  }

  const handlePrakarChange = (value: 'GRAMNIYE' | 'NAGARIYE') => {
    setSelected(prev => ({ ...prev, prakar: value }))
    resetDependentDropdowns('prakar')
    
    // Reload regions after prakar selection if jila is already selected
    if (selected.prant && selected.vibhag && selected.jila) {
      loadNagars(selected.prant.code, selected.vibhag.code, selected.jila.code)
      loadKhands(selected.prant.code, selected.vibhag.code, selected.jila.code)
    }
    
    // Based on access level and prakar, determine the flow
    if (accessLevel === 'VIEW_ONLY') {
      // For 2025 code (VIEW_ONLY), users can select up to Nagar or Khand level only
      if (value === 'NAGARIYE') {
        // For Nagariye path, final selection will be at Nagar level
        // Basti dropdown will be hidden for VIEW_ONLY users
      } else if (value === 'GRAMNIYE') {
        // For Gramniye path, final selection will be at Khand level  
        // Mandal and Gram dropdowns will be hidden for VIEW_ONLY users
      }
    }
    // For TOLI_CREATION (1925), they can continue to deeper levels
  }

  const handleNagarChange = (value: string) => {
    const nagar = regions.nagars.find(n => n.region_id.toString() === value)
    if (nagar && selected.prant && selected.vibhag && selected.jila) {
      setSelected(prev => ({ ...prev, nagar }))
      onRegionChange(nagar.region_id, nagar.name, nagar.type)
      
      // Load bastis if:
      // 1. maxRegionType is BASTI (required for BASTI_KARYAKARTA)
      // 2. OR accessLevel is TOLI_CREATION AND maxRegionType is not NAGAR (for general flow)
      if (maxRegionType === 'BASTI' || (accessLevel === 'TOLI_CREATION' && maxRegionType !== 'NAGAR')) {
        loadBastis(selected.prant.code, selected.vibhag.code, selected.jila.code, nagar.code)
      }
    }
  }

  const handleKhandChange = (value: string) => {
    const khand = regions.khands.find(k => k.region_id.toString() === value)
    if (khand && selected.prant && selected.vibhag && selected.jila) {
      setSelected(prev => ({ ...prev, khand }))
      onRegionChange(khand.region_id, khand.name, khand.type)
      
      // For VIEW_ONLY (2025) users, stop at Khand level
      // For TOLI_CREATION (1925) users, continue to load mandals
      if (accessLevel === 'TOLI_CREATION') {
        loadMandals(selected.prant.code, selected.vibhag.code, selected.jila.code, khand.code)
      }
    }
  }

  const loadBastis = async (prantCode: string, vibhagCode: string, jilaCode: string, nagarCode: string) => {
    try {
      setLoading(prev => ({ ...prev, bastis: true }))
      const response = await regionService.getRegions('BASTI', {
        prant_code: prantCode,
        vibhag_code: vibhagCode,
        jila_code: jilaCode,
        nagar_or_khand_code: nagarCode
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, bastis: response.data }))
      }
    } catch (error) {
      console.error('Error loading bastis:', error)
    } finally {
      setLoading(prev => ({ ...prev, bastis: false }))
    }
  }

  const loadMandals = async (prantCode: string, vibhagCode: string, jilaCode: string, khandCode: string) => {
    try {
      setLoading(prev => ({ ...prev, mandals: true }))
      const response = await regionService.getRegions('MANDAL', {
        prant_code: prantCode,
        vibhag_code: vibhagCode,
        jila_code: jilaCode,
        nagar_or_khand_code: khandCode
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, mandals: response.data }))
      }
    } catch (error) {
      console.error('Error loading mandals:', error)
    } finally {
      setLoading(prev => ({ ...prev, mandals: false }))
    }
  }

  const loadGrams = async (prantCode: string, vibhagCode: string, jilaCode: string, khandCode: string, mandalCode: string) => {
    try {
      setLoading(prev => ({ ...prev, grams: true }))
      const response = await regionService.getRegions('GRAM', {
        prant_code: prantCode,
        vibhag_code: vibhagCode,
        jila_code: jilaCode,
        nagar_or_khand_code: khandCode,
        mandal_code: mandalCode
      })
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, grams: response.data }))
      }
    } catch (error) {
      console.error('Error loading grams:', error)
    } finally {
      setLoading(prev => ({ ...prev, grams: false }))
    }
  }

  const handleBastiChange = (value: string) => {
    const basti = regions.bastis.find(b => b.region_id.toString() === value)
    if (basti) {
      setSelected(prev => ({ ...prev, basti }))
      onRegionChange(basti.region_id, basti.name, basti.type)
    }
  }

  const handleMandalChange = (value: string) => {
    const mandal = regions.mandals.find(m => m.region_id.toString() === value)
    if (mandal && selected.prant && selected.vibhag && selected.jila && selected.khand) {
      setSelected(prev => ({ ...prev, mandal }))
      onRegionChange(mandal.region_id, mandal.name, mandal.type)
      // Load grams if:
      // 1. maxRegionType is GRAM (required for GRAM_KARYAKARTA)
      // 2. OR maxRegionType is not MANDAL (for general flow)
      if (maxRegionType === 'GRAM' || maxRegionType !== 'MANDAL') {
        loadGrams(selected.prant.code, selected.vibhag.code, selected.jila.code, selected.khand.code, mandal.code)
      }
    }
  }

  const handleGramChange = (value: string) => {
    const gram = regions.grams.find(g => g.region_id.toString() === value)
    if (gram) {
      setSelected(prev => ({ ...prev, gram }))
      onRegionChange(gram.region_id, gram.name, gram.type)
    }
  }


  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">क्षेत्र चुनें</h2>
        <p className="text-gray-600 text-sm">कृपया अपना क्षेत्र चुनें और अपनी जानकारी भरें</p>
      </div>

      {/* Access Level Info */}
      {accessLevel && (
        <div className={`border rounded-md p-3 text-sm ${
          accessLevel === 'TOLI_CREATION' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-yellow-50 border-yellow-200 text-yellow-700'
        }`}>
          <p className="font-medium">
            {accessLevel === 'TOLI_CREATION' ? '🔓 पूर्ण एक्सेस' : '🔒 सीमित एक्सेस'}
          </p>
          <p className="text-xs mt-1">
            {accessLevel === 'TOLI_CREATION' 
              ? 'आप सभी स्तरों तक जा सकते हैं और टोली बना सकते हैं'
              : 'आप केवल नगर/खंड स्तर तक चयन कर सकते हैं (नगरीय के लिए नगर, ग्रामीण के लिए खंड)'
            }
          </p>
        </div>
      )}

      {/* Region Selection Section */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">क्षेत्र चयन</h3>
        <div className="space-y-4">

      {/* Prant Dropdown - Auto-selected to Haryana */}
      <div>
        <Label>प्रांत *</Label>
        <Select
          value={selected.prant?.region_id.toString() || ''}
          onValueChange={handlePrantChange}
          disabled={disabled || loading.prants}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={loading.prants ? "लोड हो रहा है..." : "प्रांत चुनें"} 
            />
          </SelectTrigger>
          <SelectContent>
            {regions.prants.map((prant) => (
              <SelectItem key={prant.region_id} value={prant.region_id.toString()}>
                {prant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vibhag Dropdown */}
      {selected.prant && maxRegionType !== 'PRANT' && (
        <div>
          <Label>विभाग चुनें *</Label>
          <Select
            value={selected.vibhag?.region_id.toString() || ''}
            onValueChange={handleVibhagChange}
            disabled={disabled || loading.vibhags}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={loading.vibhags ? "लोड हो रहा है..." : "विभाग चुनें"} 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.vibhags.map((vibhag) => (
                <SelectItem key={vibhag.region_id} value={vibhag.region_id.toString()}>
                  {vibhag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Jila Dropdown */}
      {selected.vibhag && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && (
        <div>
          <Label>जिला चुनें *</Label>
          <Select
            value={selected.jila?.region_id.toString() || ''}
            onValueChange={handleJilaChange}
            disabled={disabled || loading.jilas}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={loading.jilas ? "लोड हो रहा है..." : "जिला चुनें"} 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.jilas.map((jila) => (
                <SelectItem key={jila.region_id} value={jila.region_id.toString()}>
                  {jila.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Prakar Selection (Gramniye/Nagariye) */}
      {selected.jila && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && (
        <div>
          <Label>प्रकार चुनें *</Label>
          <Select
            value={selected.prakar || ''}
            onValueChange={handlePrakarChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="प्रकार चुनें" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GRAMNIYE">ग्रामीण</SelectItem>
              <SelectItem value="NAGARIYE">नगरीय</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Gramniye Path - खंड Dropdown */}
      {selected.prakar === 'GRAMNIYE' && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && (
        <div>
          <Label>खंड चुनें *</Label>
          <Select
            value={selected.khand?.region_id.toString() || ''}
            onValueChange={handleKhandChange}
            disabled={disabled || loading.khands || regions.khands.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loading.khands ? "लोड हो रहा है..." : 
                  regions.khands.length === 0 ? "कोई खंड उपलब्ध नहीं" :
                  "खंड चुनें"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.khands.map((khand) => (
                <SelectItem key={khand.region_id} value={khand.region_id.toString()}>
                  {khand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.khands.length === 0 && !loading.khands && (
            <p className="text-sm text-gray-500 mt-1">इस जिले में कोई खंड उपलब्ध नहीं है</p>
          )}
        </div>
      )}

      {/* Mandal Dropdown (for Gramniye path) - Only for TOLI_CREATION users */}
      {selected.khand && accessLevel === 'TOLI_CREATION' && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && maxRegionType !== 'KHAND' && (
        <div>
          <Label>मंडल चुनें *</Label>
          <Select
            value={selected.mandal?.region_id.toString() || ''}
            onValueChange={handleMandalChange}
            disabled={disabled || loading.mandals || regions.mandals.length === 0 || maxRegionType === 'MANDAL'}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loading.mandals ? "लोड हो रहा है..." : 
                  regions.mandals.length === 0 ? "कोई मंडल उपलब्ध नहीं" :
                  "मंडल चुनें"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.mandals.map((mandal) => (
                <SelectItem key={mandal.region_id} value={mandal.region_id.toString()}>
                  {mandal.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.mandals.length === 0 && !loading.mandals && (
            <p className="text-sm text-gray-500 mt-1">इस खंड में कोई मंडल उपलब्ध नहीं है</p>
          )}
        </div>
      )}

      {/* Gram Dropdown (for Gramniye path) - Show for TOLI_CREATION users or when maxRegionType is GRAM */}
      {selected.mandal && (accessLevel === 'TOLI_CREATION' || maxRegionType === 'GRAM') && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && maxRegionType !== 'KHAND' && maxRegionType !== 'MANDAL' && (
        <div>
          <Label>ग्राम चुनें *</Label>
          <Select
            value={selected.gram?.region_id.toString() || ''}
            onValueChange={handleGramChange}
            disabled={disabled || loading.grams || regions.grams.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loading.grams ? "लोड हो रहा है..." : 
                  regions.grams.length === 0 ? "कोई ग्राम उपलब्ध नहीं" :
                  "ग्राम चुनें"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.grams.map((gram) => (
                <SelectItem key={gram.region_id} value={gram.region_id.toString()}>
                  {gram.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.grams.length === 0 && !loading.grams && (
            <p className="text-sm text-gray-500 mt-1">इस मंडल में कोई ग्राम उपलब्ध नहीं है</p>
          )}
        </div>
      )}

      {/* Nagariye Path - नगर Dropdown */}
      {selected.prakar === 'NAGARIYE' && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && (
        <div>
          <Label>नगर चुनें *</Label>
          <Select
            value={selected.nagar?.region_id.toString() || ''}
            onValueChange={handleNagarChange}
            disabled={disabled || loading.nagars || regions.nagars.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loading.nagars ? "लोड हो रहा है..." : 
                  regions.nagars.length === 0 ? "कोई नगर उपलब्ध नहीं" :
                  "नगर चुनें"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.nagars.map((nagar) => (
                <SelectItem key={nagar.region_id} value={nagar.region_id.toString()}>
                  {nagar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.nagars.length === 0 && !loading.nagars && (
            <p className="text-sm text-gray-500 mt-1">इस जिले में कोई नगर उपलब्ध नहीं है</p>
          )}
        </div>
      )}

      {/* Basti Dropdown (for Nagariye path) - Show for TOLI_CREATION users or when maxRegionType is BASTI */}
      {selected.nagar && (accessLevel === 'TOLI_CREATION' || maxRegionType === 'BASTI') && maxRegionType !== 'PRANT' && maxRegionType !== 'VIBHAG' && maxRegionType !== 'JILA' && maxRegionType !== 'NAGAR' && (
        <div>
          <Label>बस्ती चुनें *</Label>
          <Select
            value={selected.basti?.region_id.toString() || ''}
            onValueChange={handleBastiChange}
            disabled={disabled || loading.bastis || regions.bastis.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loading.bastis ? "लोड हो रहा है..." : 
                  regions.bastis.length === 0 ? "कोई बस्ती उपलब्ध नहीं" :
                  "बस्ती चुनें"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {regions.bastis.map((basti) => (
                <SelectItem key={basti.region_id} value={basti.region_id.toString()}>
                  {basti.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {regions.bastis.length === 0 && !loading.bastis && (
            <p className="text-sm text-gray-500 mt-1">इस नगर में कोई बस्ती उपलब्ध नहीं है</p>
          )}
        </div>
      )}
        </div>
      </div>

      {/* User Details Section */}
      {/* {(
        (selected.prakar === 'NAGARIYE' && selected.nagar) ||
        (selected.prakar === 'GRAMNIYE' && selected.khand)
      ) && (
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">व्यक्तिगत जानकारी</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">उपयोगकर्ता नाम *</Label>
              <input
                id="username"
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="उपयोगकर्ता नाम दर्ज करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">पासवर्ड *</Label>
              <input
                id="password"
                type="password"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="पासवर्ड दर्ज करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">पासवर्ड की पुष्टि करें *</Label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="पासवर्ड की पुष्टि करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="mobile">मोबाइल नंबर *</Label>
              <input
                id="mobile"
                type="tel"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="मोबाइल नंबर दर्ज करें"
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div>
              <Label htmlFor="fullName">पूरा नाम *</Label>
              <input
                id="fullName"
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="अपना पूरा नाम दर्ज करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="fatherName">पिता का नाम *</Label>
              <input
                id="fatherName"
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="पिता का नाम दर्ज करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="age">आयु *</Label>
              <input
                id="age"
                type="number"
                min="18"
                max="100"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="आयु दर्ज करें"
                required
              />
            </div>
            <div>
              <Label htmlFor="education">शिक्षा *</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="शिक्षा चुनें" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">प्राथमिक</SelectItem>
                  <SelectItem value="secondary">माध्यमिक</SelectItem>
                  <SelectItem value="higher-secondary">उच्च माध्यमिक</SelectItem>
                  <SelectItem value="graduate">स्नातक</SelectItem>
                  <SelectItem value="post-graduate">स्नातकोत्तर</SelectItem>
                  <SelectItem value="other">अन्य</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="occupation">व्यवसाय *</Label>
              <input
                id="occupation"
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="व्यवसाय दर्ज करें"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">पूरा पता *</Label>
              <textarea
                id="address"
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="पूरा पता दर्ज करें"
                required
              />
            </div>
          </div>
        </div>
      )} */}

      {/* Selection Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
        <p className="font-medium text-blue-800 mb-1">चयनित क्षेत्र:</p>
        <div className="text-blue-700 space-y-1">
          {selected.prant && <div>प्रांत: {selected.prant.name}</div>}
          {selected.vibhag && <div>विभाग: {selected.vibhag.name}</div>}
          {selected.jila && <div>जिला: {selected.jila.name}</div>}
          {selected.prakar && (
            <div>प्रकार: {selected.prakar === 'GRAMNIYE' ? 'ग्रामीण' : 'नगरीय'}</div>
          )}
          {selected.nagar && <div>नगर: {selected.nagar.name}</div>}
          {selected.khand && <div>खंड: {selected.khand.name}</div>}
          {selected.basti && <div>बस्ती: {selected.basti.name}</div>}
          {selected.mandal && <div>मंडल: {selected.mandal.name}</div>}
          {selected.gram && <div>ग्राम: {selected.gram.name}</div>}
        </div>
      </div>
    </div>
  )
}