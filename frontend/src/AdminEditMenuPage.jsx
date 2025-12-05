import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  Container, Heading, VStack, FormControl, FormLabel, Input,
  Textarea, NumberInput, NumberInputField, Button, useToast,
  Spinner, Center, Text, Image, Box, Checkbox, Wrap, WrapItem
} from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom' // Pour lire l'ID de l'URL

// Liste des allergènes selon règlement UE 1169/2011
const ALLERGENS_LIST = [
  { id: 'gluten', label: 'Gluten (céréales)' },
  { id: 'crustaces', label: 'Crustacés' },
  { id: 'oeufs', label: 'Œufs' },
  { id: 'poissons', label: 'Poissons' },
  { id: 'arachides', label: 'Arachides' },
  { id: 'soja', label: 'Soja' },
  { id: 'lait', label: 'Lait' },
  { id: 'fruits_coque', label: 'Fruits à coque' },
  { id: 'celeri', label: 'Céleri' },
  { id: 'moutarde', label: 'Moutarde' },
  { id: 'sesame', label: 'Graines de sésame' },
  { id: 'sulfites', label: 'Sulfites' },
  { id: 'lupin', label: 'Lupin' },
  { id: 'mollusques', label: 'Mollusques' }
]

export default function AdminEditMenuPage() {
  const { menuId } = useParams() // Récupère le 'menuId' de l'URL
  const navigate = useNavigate() // Pour rediriger
  const toast = useToast()
  
  const [loading, setLoading] = useState(true)
  const [menu, setMenu] = useState(null) // Pour stocker les données du menu

  // États pour les champs du formulaire
  const [weekName, setWeekName] = useState('')
  const [description, setDescription] = useState('')
  const [recipeDetails, setRecipeDetails] = useState('')
  const [allergens, setAllergens] = useState([])
  const [price, setPrice] = useState('0.00')
  const [imageFile, setImageFile] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 1. Fetcher le menu à modifier au chargement
  useEffect(() => {
    async function fetchMenu() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('menus')
          .select('*')
          .eq('id', menuId)
          .single()

        if (error) throw error

        // Pré-remplir le formulaire avec les données
        setMenu(data)
        setWeekName(data.week_name)
        setDescription(data.description)
        setRecipeDetails(data.recipe_details || '')
        setAllergens(data.allergens || [])
        setPrice(data.price.toString())
        setExistingImageUrl(data.image_url)

      } catch (error) {
        toast({ title: "Erreur", description: "Menu introuvable.", status: "error" })
        navigate('/admin/menus') // Rediriger si le menu n'existe pas
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [menuId, navigate, toast])

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setExistingImageUrl('') // On cache l'ancienne image
    }
  }

  const handleAllergenToggle = (allergenId) => {
    setAllergens(prev => {
      if (prev.includes(allergenId)) {
        return prev.filter(id => id !== allergenId)
      } else {
        return [...prev, allergenId]
      }
    })
  }

  // 2. Logique de MISE A JOUR
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let finalImageUrl = existingImageUrl

      // Étape A: Si une NOUVELLE image est téléversée
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName)
        
        finalImageUrl = urlData.publicUrl
        
        // (Optionnel: supprimer l'ancienne image du storage)
      }

      // Étape B: Mettre à jour la table 'menus'
      const { error: updateError } = await supabase
        .from('menus')
        .update({
          week_name: weekName,
          description: description,
          recipe_details: recipeDetails,
          allergens: allergens,
          price: parseFloat(price),
          image_url: finalImageUrl
        })
        .eq('id', menuId) // Très important !
      
      if (updateError) throw updateError

      toast({
        title: "Menu mis à jour !",
        status: "success",
      })
      navigate('/admin/menus') // Rediriger vers la liste

    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error)
      toast({ title: "Erreur", description: error.message, status: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <Center><Spinner size="xl" /></Center>
  }

  return (
    <Container maxW="container.lg">
      <Heading mb={6}>Modifier le Menu : {menu.week_name}</Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch" maxW="container.md">
          <FormControl isRequired>
            <FormLabel>Nom du menu</FormLabel>
            <Input value={weekName} onChange={(e) => setWeekName(e.target.value)} />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>

          <FormControl>
            <FormLabel>Détails de la recette (HTML)</FormLabel>
            <Textarea
              value={recipeDetails}
              onChange={(e) => setRecipeDetails(e.target.value)}
              placeholder="<h2>Ingrédients</h2><ul><li>...</li></ul><h2>Préparation</h2><ol><li>...</li></ol>"
              minH="200px"
              fontFamily="monospace"
              fontSize="sm"
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Vous pouvez utiliser du HTML pour formater la recette (h2, ul, ol, li, p, strong, em)
            </Text>
          </FormControl>

          <FormControl>
            <FormLabel>Allergènes présents</FormLabel>
            <Text fontSize="xs" color="gray.500" mb={3}>
              Cochez tous les allergènes présents dans ce plat (règlement UE 1169/2011)
            </Text>
            <Wrap spacing={3}>
              {ALLERGENS_LIST.map(allergen => (
                <WrapItem key={allergen.id}>
                  <Checkbox
                    isChecked={allergens.includes(allergen.id)}
                    onChange={() => handleAllergenToggle(allergen.id)}
                    colorScheme="orange"
                  >
                    {allergen.label}
                  </Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Prix (€)</FormLabel>
            <NumberInput precision={2} min={0} value={price} onChange={(valueString) => setPrice(valueString)}>
              <NumberInputField />
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Image du menu</FormLabel>
            {existingImageUrl && (
              <Box mb={4}>
                <Text fontSize="sm" mb={2}>Image actuelle :</Text>
                <Image src={existingImageUrl} alt="Aperçu" boxSize="150px" objectFit="cover" borderRadius="md" />
              </Box>
            )}
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              p={1}
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
            Enregistrer les modifications
          </Button>
        </VStack>
      </form>
    </Container>
  )
}