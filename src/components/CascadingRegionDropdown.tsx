import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { regionService } from '@/api/services'
import type { Region } from '@/types'

interface CascadingRegionDropdownProps {
  onRegionChange: (regionId: number, regionName: string, regionType: string) => void
  disabled?: boolean
}

interface RegionState {
  vibhags: Region[]
  jilas: Region[]
  nagars: Region[]
  khands: Region[]
  bastis: Region[]
  mandals: Region[]
  grams: Region[]
}

interface SelectedRegions {
  vibhag: Region | null
  jila: Region | null
  nagar: Region | null
  khand: Region | null
  basti: Region | null
  mandal: Region | null
  gram: Region | null
}

export default function CascadingRegionDropdown({ onRegionChange, disabled = false }: CascadingRegionDropdownProps) {
  const [regions, setRegions] = useState<RegionState>({
    vibhags: [],
    jilas: [],
    nagars: [],
    khands: [],
    bastis: [],
    mandals: [],
    grams: []
  })

  const [selected, setSelected] = useState<SelectedRegions>({
    vibhag: null,
    jila: null,
    nagar: null,
    khand: null,
    basti: null,
    mandal: null,
    gram: null
  })

  const [loading, setLoading] = useState({
    vibhags: false,
    jilas: false,
    nagars: false,
    khands: false,
    bastis: false,
    mandals: false,
    grams: false
  })

  // Load initial vibhags
  useEffect(() => {
    loadVibhags()
  }, [])

  const loadVibhags = async () => {
    try {
      setLoading(prev => ({ ...prev, vibhags: true }))
      const response = await regionService.getVibhags()
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, vibhags: response.data }))
      }
    } catch (error) {
      console.error('Error loading vibhags:', error)
    } finally {
      setLoading(prev => ({ ...prev, vibhags: false }))
    }
  }

  const loadJilas = async (vibhagCode: string) => {
    try {
      setLoading(prev => ({ ...prev, jilas: true }))
      const response = await regionService.getJilas(vibhagCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, jilas: response.data }))
      }
    } catch (error) {
      console.error('Error loading jilas:', error)
    } finally {
      setLoading(prev => ({ ...prev, jilas: false }))
    }
  }

  const loadNagars = async (jilaCode: string) => {
    try {
      setLoading(prev => ({ ...prev, nagars: true }))
      const response = await regionService.getNagars(jilaCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, nagars: response.data }))
      }
    } catch (error) {
      console.error('Error loading nagars:', error)
    } finally {
      setLoading(prev => ({ ...prev, nagars: false }))
    }
  }

  const loadKhands = async (jilaCode: string, vibhagCode: string) => {
    try {
      setLoading(prev => ({ ...prev, khands: true }))
      const response = await regionService.getKhands(jilaCode, vibhagCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, khands: response.data }))
      }
    } catch (error) {
      console.error('Error loading khands:', error)
    } finally {
      setLoading(prev => ({ ...prev, khands: false }))
    }
  }

  const loadBastis = async (nagarOrKhandCode: string, jilaCode: string, vibhagCode: string) => {
    try {
      setLoading(prev => ({ ...prev, bastis: true }))
      const response = await regionService.getBastis(nagarOrKhandCode, jilaCode, vibhagCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, bastis: response.data }))
      }
    } catch (error) {
      console.error('Error loading bastis:', error)
    } finally {
      setLoading(prev => ({ ...prev, bastis: false }))
    }
  }

  const loadMandals = async (jilaCode: string, vibhagCode: string, nagarOrKhandCode: string) => {
    try {
      setLoading(prev => ({ ...prev, mandals: true }))
      const response = await regionService.getMandals(jilaCode, vibhagCode, nagarOrKhandCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, mandals: response.data }))
      }
    } catch (error) {
      console.error('Error loading mandals:', error)
    } finally {
      setLoading(prev => ({ ...prev, mandals: false }))
    }
  }

  const loadGrams = async (nagarOrKhandCode: string, jilaCode: string, vibhagCode: string, mandalCode: string) => {
    try {
      setLoading(prev => ({ ...prev, grams: true }))
      const response = await regionService.getGrams(nagarOrKhandCode, jilaCode, vibhagCode, mandalCode)
      if (response.success && response.data) {
        setRegions(prev => ({ ...prev, grams: response.data }))
      }
    } catch (error) {
      console.error('Error loading grams:', error)
    } finally {
      setLoading(prev => ({ ...prev, grams: false }))
    }
  }

  // Reset dependent dropdowns
  const resetDependentDropdowns = (level: keyof SelectedRegions) => {
    const resetMap: Record<keyof SelectedRegions, (keyof SelectedRegions)[]> = {
      vibhag: ['jila', 'nagar', 'khand', 'basti', 'mandal', 'gram'],
      jila: ['nagar', 'khand', 'basti', 'mandal', 'gram'],
      nagar: ['basti', 'mandal', 'gram'],
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
        const pluralKey = (key + 's') as keyof RegionState
        newRegions[pluralKey] = []
      })
      return newRegions
    })
  }

  const handleVibhagChange = (value: string) => {
    const vibhag = regions.vibhags.find(v => v.region_id.toString() === value)
    if (vibhag) {
      setSelected(prev => ({ ...prev, vibhag }))
      resetDependentDropdowns('vibhag')
      loadJilas(vibhag.code)
      onRegionChange(vibhag.region_id, vibhag.name, vibhag.type)
    }
  }

  const handleJilaChange = (value: string) => {
    const jila = regions.jilas.find(j => j.region_id.toString() === value)
    if (jila && selected.vibhag) {
      setSelected(prev => ({ ...prev, jila }))
      resetDependentDropdowns('jila')
      // Load both Nagars and Khands for the selected Jila
      // User will choose one path or the other
      loadNagars(jila.code)
      loadKhands(jila.code, selected.vibhag.code)
      onRegionChange(jila.region_id, jila.name, jila.type)
    }
  }

  const handleNagarChange = (value: string) => {
    const nagar = regions.nagars.find(n => n.region_id.toString() === value)
    if (nagar && selected.vibhag && selected.jila) {
      setSelected(prev => ({ 
        ...prev, 
        nagar,
        // Clear Khand path selections when Nagar is selected
        khand: null,
        mandal: null,
        gram: null
      }))
      // Reset regions for Khand path
      setRegions(prev => ({
        ...prev,
        khands: [], // Clear Khand options since we're going Nagar path
        mandals: [],
        grams: []
      }))
      loadBastis(nagar.code, selected.jila.code, selected.vibhag.code)
      onRegionChange(nagar.region_id, nagar.name, nagar.type)
    }
  }

  const handleKhandChange = (value: string) => {
    const khand = regions.khands.find(k => k.region_id.toString() === value)
    if (khand && selected.vibhag && selected.jila) {
      setSelected(prev => ({ 
        ...prev, 
        khand,
        // Clear Nagar path selections when Khand is selected
        nagar: null,
        basti: null
      }))
      // Reset regions for Nagar path
      setRegions(prev => ({
        ...prev,
        nagars: [], // Clear Nagar options since we're going Khand path
        bastis: []
      }))
      loadMandals(selected.jila.code, selected.vibhag.code, khand.code)
      onRegionChange(khand.region_id, khand.name, khand.type)
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
    if (mandal && selected.vibhag && selected.jila && selected.khand) {
      setSelected(prev => ({ ...prev, mandal }))
      resetDependentDropdowns('mandal')
      loadGrams(selected.khand.code, selected.jila.code, selected.vibhag.code, mandal.code)
      onRegionChange(mandal.region_id, mandal.name, mandal.type)
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
    <div className="space-y-4">
      {/* Vibhag Dropdown */}
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

      {/* Jila Dropdown */}
      {selected.vibhag && (
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

      {/* Path Selection: Nagar OR Khand (shown side by side if both available) */}
      {selected.jila && (regions.nagars.length > 0 || regions.khands.length > 0) && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm">
            <p className="font-medium text-yellow-800 mb-1">पथ चुनें:</p>
            <p className="text-yellow-700">• नगर → बस्ती (नगर पथ)</p>
            <p className="text-yellow-700">• खंड → मंडल → ग्राम (खंड पथ)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nagar Dropdown */}
            {regions.nagars.length > 0 && !selected.khand && (
              <div>
                <Label>नगर चुनें</Label>
                <Select
                  value={selected.nagar?.region_id.toString() || ''}
                  onValueChange={handleNagarChange}
                  disabled={disabled || loading.nagars}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={loading.nagars ? "लोड हो रहा है..." : "नगर चुनें"} 
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
              </div>
            )}

            {/* Khand Dropdown */}
            {regions.khands.length > 0 && !selected.nagar && (
              <div>
                <Label>खंड चुनें</Label>
                <Select
                  value={selected.khand?.region_id.toString() || ''}
                  onValueChange={handleKhandChange}
                  disabled={disabled || loading.khands}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={loading.khands ? "लोड हो रहा है..." : "खंड चुनें"} 
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* Basti Dropdown (only for Nagar path) */}
      {selected.nagar && regions.bastis.length > 0 && (
        <div>
          <Label>बस्ती चुनें</Label>
          <Select
            value={selected.basti?.region_id.toString() || ''}
            onValueChange={handleBastiChange}
            disabled={disabled || loading.bastis}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={loading.bastis ? "लोड हो रहा है..." : "बस्ती चुनें"} 
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
        </div>
      )}

      {/* Mandal Dropdown (only for Khand path) */}
      {selected.khand && regions.mandals.length > 0 && (
        <div>
          <Label>मंडल चुनें</Label>
          <Select
            value={selected.mandal?.region_id.toString() || ''}
            onValueChange={handleMandalChange}
            disabled={disabled || loading.mandals}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={loading.mandals ? "लोड हो रहा है..." : "मंडल चुनें"} 
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
        </div>
      )}

      {/* Gram Dropdown (only for Khand -> Mandal path) */}
      {selected.mandal && regions.grams.length > 0 && (
        <div>
          <Label>ग्राम चुनें</Label>
          <Select
            value={selected.gram?.region_id.toString() || ''}
            onValueChange={handleGramChange}
            disabled={disabled || loading.grams}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={loading.grams ? "लोड हो रहा है..." : "ग्राम चुनें"} 
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
        </div>
      )}

      {/* Selection Summary */}
      {(selected.vibhag || selected.jila || selected.nagar || selected.khand || selected.basti || selected.mandal || selected.gram) && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
          <p className="font-medium text-blue-800 mb-1">चयनित क्षेत्र:</p>
          <div className="text-blue-700">
            {selected.vibhag && <span>विभाग: {selected.vibhag.name}</span>}
            {selected.jila && <span> → जिला: {selected.jila.name}</span>}
            {selected.nagar && <span> → नगर: {selected.nagar.name}</span>}
            {selected.khand && <span> → खंड: {selected.khand.name}</span>}
            {selected.basti && <span> → बस्ती: {selected.basti.name}</span>}
            {selected.mandal && <span> → मंडल: {selected.mandal.name}</span>}
            {selected.gram && <span> → ग्राम: {selected.gram.name}</span>}
          </div>
        </div>
      )}
    </div>
  )
}