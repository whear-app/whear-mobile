import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText, Avatar, TagChip, LoadingSpinner, EmptyState, GradientBackground } from '../../components';
import { MainStackParamList } from '../../navigation/types';
import { ROUTES, TAB_ROUTES } from '../../constants/routes';
import { spacing as spacingConstants, borderRadius as borderRadiusConstants } from '../../constants/theme';
import { useAuthStore } from '../../features/authStore';
import { useClothesStorageStore, ClothStorageItem, ClothSource } from '../../features/clothesStorageStore';
import { ItemCategory } from '../../models';
import { colorNames, getColorHex } from '../../utils/colors';

const Icon = MaterialCommunityIcons;
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

// Clothing categories with subcategories
const clothingCategories: Record<string, string[]> = {
  top: ['T-shirt', 'Shirt', 'Blouse', 'Tank Top', 'Sweater', 'Hoodie', 'Cardigan', 'Crop Top', 'Polo', 'Tunic'],
  bottom: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants', 'Cargo Pants', 'Chinos', 'Palazzo'],
  dress: ['Maxi Dress', 'Midi Dress', 'Mini Dress', 'A-line Dress', 'Bodycon', 'Wrap Dress', 'Shirt Dress'],
  outerwear: ['Jacket', 'Coat', 'Blazer', 'Bomber', 'Windbreaker', 'Trench Coat', 'Denim Jacket', 'Leather Jacket'],
  shoes: ['Sneakers', 'Heels', 'Boots', 'Sandals', 'Flats', 'Loafers', 'Ankle Boots', 'Wedges', 'Espadrilles'],
  accessory: ['Hat', 'Cap', 'Scarf', 'Belt', 'Sunglasses', 'Watch', 'Gloves', 'Tie', 'Bow Tie'],
  jewelry: ['Earrings', 'Necklace', 'Ring', 'Bracelet', 'Anklet', 'Brooch', 'Hairpin', 'Hair Clip'],
  bag: ['Handbag', 'Backpack', 'Tote Bag', 'Clutch', 'Crossbody', 'Shoulder Bag', 'Wallet', 'Pouch'],
  other: ['Swimwear', 'Activewear', 'Lingerie', 'Socks', 'Tights', 'Undergarments'],
};

// Material options
const materials = ['Cotton', 'Polyester', 'Silk', 'Wool', 'Linen', 'Denim', 'Leather', 'Suede', 'Cashmere', 'Rayon', 'Spandex', 'Nylon', 'Chiffon', 'Satin', 'Velvet'];

// Season options
const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];

// Style options
const styleOptions = ['Casual', 'Formal', 'Sporty', 'Elegant', 'Bohemian', 'Vintage', 'Modern', 'Classic', 'Streetwear', 'Minimalist', 'Romantic', 'Edgy'];

// Color options - capitalize first letter
const colorOptions = colorNames.map(color => color.charAt(0).toUpperCase() + color.slice(1));

// Source options
const sourceOptions: { label: string; value: ClothSource; icon: string }[] = [
  { label: 'Manual', value: 'manual', icon: 'hand-pointing-right' },
  { label: 'Shopee', value: 'shopee', icon: 'shopping' },
  { label: 'TikTok Shop', value: 'tiktokshop', icon: 'video' },
  { label: 'Lazada', value: 'lazada', icon: 'cart' },
  { label: 'Other', value: 'other', icon: 'dots-horizontal' },
];

export const ClothesStorageScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { items, isLoading, fetchItems, addItem, updateItem, deleteItem, syncFromEcommerce } = useClothesStorageStore();
  const { colors, spacing, borderRadius, blur, isDark } = useAppTheme();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothStorageItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Add form state
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | ''>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');
  const [source, setSource] = useState<ClothSource>('manual');
  const [sourceOrderId, setSourceOrderId] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [notes, setNotes] = useState('');

  // Autocomplete states
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [subcategoryMenuVisible, setSubcategoryMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [materialMenuVisible, setMaterialMenuVisible] = useState(false);
  const [seasonMenuVisible, setSeasonMenuVisible] = useState(false);
  const [styleMenuVisible, setStyleMenuVisible] = useState(false);
  const [sourceMenuVisible, setSourceMenuVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchItems(user.id);
    }
  }, [user]);

  const handleAddCloth = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const handlePickImage = async () => {
    Alert.alert(
      t('common.selectImage') || 'Select Image',
      t('common.chooseOption') || 'Choose an option',
      [
        { text: t('common.camera') || 'Camera', onPress: takePhoto },
        { text: t('common.gallery') || 'Gallery', onPress: pickImage },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setImageUri(null);
    setName('');
    setSelectedCategory('');
    setSelectedSubcategory([]);
    setSelectedColors([]);
    setSelectedMaterials([]);
    setSelectedSeasons([]);
    setSelectedStyles([]);
    setBrand('');
    setSize('');
    setSource('manual');
    setSourceOrderId('');
    setPrice('');
    setPurchaseDate('');
    setNotes('');
  };

  const handleSaveItem = async () => {
    if (!user || !imageUri) {
      Alert.alert('Error', 'Please select an image');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (selectedColors.length === 0) {
      Alert.alert('Error', 'Please select at least one color');
      return;
    }

    try {
      await addItem({
        userId: user.id,
        imageUri,
        category: selectedCategory as ItemCategory,
        colors: selectedColors,
        tags: selectedSubcategory,
        name: name.trim(),
        source,
        sourceOrderId: sourceOrderId.trim() || undefined,
        brand: brand.trim() || undefined,
        size: size.trim() || undefined,
        material: selectedMaterials,
        season: selectedSeasons,
        style: selectedStyles,
        price: price ? parseFloat(price) : undefined,
        purchaseDate: purchaseDate || undefined,
        notes: notes.trim() || undefined,
      });
      resetForm();
      setAddModalVisible(false);
      Alert.alert('Success', 'Item added successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleItemPress = (item: ClothStorageItem) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
    setEditMode(false);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setEditMode(true);
      setImageUri(selectedItem.imageUri);
      setName(selectedItem.name || '');
      setSelectedCategory(selectedItem.category);
      setSelectedSubcategory(selectedItem.tags || []);
      setSelectedColors(selectedItem.colors || []);
      setSelectedMaterials(selectedItem.material || []);
      setSelectedSeasons(selectedItem.season || []);
      setSelectedStyles(selectedItem.style || []);
      setBrand(selectedItem.brand || '');
      setSize(selectedItem.size || '');
      setSource(selectedItem.source);
      setSourceOrderId(selectedItem.sourceOrderId || '');
      setPrice(selectedItem.price?.toString() || '');
      setPurchaseDate(selectedItem.purchaseDate || '');
      setNotes(selectedItem.notes || '');
    }
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;

    try {
      await updateItem(selectedItem.id, {
        name: name.trim() || undefined,
        category: selectedCategory as ItemCategory,
        colors: selectedColors,
        tags: selectedSubcategory,
        material: selectedMaterials,
        season: selectedSeasons,
        style: selectedStyles,
        brand: brand.trim() || undefined,
        size: size.trim() || undefined,
        source,
        sourceOrderId: sourceOrderId.trim() || undefined,
        price: price ? parseFloat(price) : undefined,
        purchaseDate: purchaseDate || undefined,
        notes: notes.trim() || undefined,
      });
      setEditMode(false);
      setDetailModalVisible(false);
      Alert.alert('Success', 'Item updated successfully!');
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const handleDeleteItem = () => {
    if (!selectedItem) return;

    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(selectedItem.id);
              setDetailModalVisible(false);
              setSelectedItem(null);
              Alert.alert('Success', 'Item deleted successfully!');
            } catch (error) {
              Alert.alert('Error', (error as Error).message);
            }
          },
        },
      ]
    );
  };

  const handleSync = async (platform: 'shopee' | 'tiktokshop' | 'lazada') => {
    if (!user) return;

    // Mock orders - replace with actual API integration
    const mockOrders = [
      {
        orderId: `${platform}-${Date.now()}`,
        name: 'Sample Item from ' + platform,
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
        category: 'top' as ItemCategory,
        colors: ['blue'],
        tags: ['casual'],
        brand: 'Sample Brand',
        size: 'M',
        material: ['cotton'],
        season: ['summer'],
        style: ['casual'],
        purchaseDate: new Date().toISOString().split('T')[0],
        price: 19.99,
      },
    ];

    try {
      await syncFromEcommerce(user.id, platform, mockOrders);
      setSyncModalVisible(false);
      Alert.alert('Success', `Synced ${mockOrders.length} items from ${platform}!`);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setSelected: (value: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };


  const renderItem = ({ item }: { item: ClothStorageItem }) => {
    const sourceInfo = sourceOptions.find((s) => s.value === item.source);

    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: isDark ? '#000' : '#000',
            borderColor: colors.glassBorder,
          },
        ]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={[styles.itemImage, { borderRadius: borderRadius.md }]}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <AppText variant="h3" style={{ fontWeight: '600', marginBottom: spacing.xs, color: colors.textPrimary }}>
            {item.name || 'Unnamed Item'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            {item.brand && ` • ${item.brand}`}
          </AppText>
          {sourceInfo && (
            <View style={[styles.sourceBadge, { backgroundColor: colors.accentLight }]}>
              <Icon name={sourceInfo.icon} size={12} color={colors.accent} />
              <AppText variant="caption" style={{ color: colors.accent, marginLeft: spacing.xs }}>
                {sourceInfo.label}
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderAutocompleteField = (
    label: string,
    value: string | string[],
    placeholder: string,
    menuVisible: boolean,
    setMenuVisible: (visible: boolean) => void,
    options: string[] | { label: string; value: string; icon?: string }[],
    onSelect: (value: string) => void,
    isMultiSelect = false,
    selectedValues: string[] = []
  ) => {
    const displayValue = Array.isArray(value) ? (value.length > 0 ? `${value.length} selected` : placeholder) : value || placeholder;

    return (
      <View style={styles.fieldContainer}>
        <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
          {label}
        </AppText>
        <TouchableOpacity
          style={[
            styles.autocompleteInput,
            {
              backgroundColor: colors.glassSurface,
              borderColor: colors.glassBorder,
              borderRadius: borderRadius.sm,
              minHeight: isMultiSelect && selectedValues.length > 0 ? 'auto' : 48,
              paddingVertical: isMultiSelect && selectedValues.length > 0 ? spacing.xs : 0,
            },
          ]}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          {isMultiSelect && selectedValues.length > 0 ? (
            <View style={styles.chipsContainerInline}>
              {selectedValues.map((item) => (
                <View key={item} style={[styles.chipInline, { backgroundColor: colors.accentLight }]}>
                  <AppText variant="caption" style={{ color: colors.accent, marginRight: spacing.xs }}>
                    {item}
                  </AppText>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      if (label === 'Subcategory') {
                        setSelectedSubcategory(selectedSubcategory.filter((v) => v !== item));
                      } else if (label === 'Materials') {
                        setSelectedMaterials(selectedMaterials.filter((v) => v !== item));
                      } else if (label === 'Seasons') {
                        setSelectedSeasons(selectedSeasons.filter((v) => v !== item));
                      } else if (label === 'Styles') {
                        setSelectedStyles(selectedStyles.filter((v) => v !== item));
                      }
                    }}
                  >
                    <Icon name="close-circle" size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <AppText variant="body" color={displayValue === placeholder ? colors.textSecondary : colors.textPrimary}>
              {displayValue}
            </AppText>
          )}
          <Icon name={menuVisible ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        {menuVisible && (
          <View
            style={[
              styles.autocompleteMenu,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.glassBorder,
                borderRadius: borderRadius.md,
              },
            ]}
          >
            <ScrollView style={styles.menuScroll} nestedScrollEnabled>
              {options.map((option) => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                const isSelected = isMultiSelect ? selectedValues.includes(optionValue) : value === optionValue;

                return (
                  <TouchableOpacity
                    key={optionValue}
                    style={[
                      styles.menuItem,
                      isSelected && { backgroundColor: colors.accentLight },
                      { borderBottomColor: colors.glassBorder },
                    ]}
                    onPress={() => {
                      if (isMultiSelect) {
                        toggleMultiSelect(optionValue, selectedValues, (newValues) => {
                          if (label === 'Subcategory') {
                            setSelectedSubcategory(newValues);
                          } else if (label === 'Materials') {
                            setSelectedMaterials(newValues);
                          } else if (label === 'Seasons') {
                            setSelectedSeasons(newValues);
                          } else if (label === 'Styles') {
                            setSelectedStyles(newValues);
                          }
                        });
                      } else {
                        onSelect(optionValue);
                        setMenuVisible(false);
                      }
                    }}
                  >
                    {typeof option !== 'string' && option.icon && (
                      <Icon name={option.icon} size={20} color={isSelected ? colors.accent : colors.textSecondary} style={{ marginRight: spacing.sm }} />
                    )}
                    <AppText variant="body" color={isSelected ? colors.accent : colors.textPrimary}>
                      {optionLabel}
                    </AppText>
                    {isSelected && <Icon name="check" size={20} color={colors.accent} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderColorPicker = () => {
    return (
      <View style={styles.fieldContainer}>
        <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
          Colors *
        </AppText>
        <View
          style={[
            styles.colorPickerContainer,
            {
              backgroundColor: colors.glassSurface,
              borderColor: colors.glassBorder,
              borderRadius: borderRadius.sm,
            },
          ]}
        >
          <View style={styles.colorPickerGrid}>
            {colorNames.map((colorName) => {
              const colorHex = getColorHex(colorName);
              const isSelected = selectedColors.includes(colorName.charAt(0).toUpperCase() + colorName.slice(1));
              
              return (
                <TouchableOpacity
                  key={colorName}
                  style={[
                    styles.colorPickerItem,
                    {
                      backgroundColor: colorHex,
                      borderColor: isSelected ? colors.accent : colors.glassBorder,
                      borderWidth: isSelected ? 3 : 1,
                    },
                  ]}
                  onPress={() => {
                    toggleMultiSelect(
                      colorName.charAt(0).toUpperCase() + colorName.slice(1),
                      selectedColors,
                      (newValues) => setSelectedColors(newValues)
                    );
                  }}
                >
                  {isSelected && (
                    <View style={styles.colorPickerCheck}>
                      <Icon name="check" size={16} color={colorName === 'white' || colorName === 'beige' || colorName === 'yellow' ? '#000' : '#FFF'} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedColors.length > 0 && (
            <View style={[styles.selectedColorsContainer, { borderTopColor: colors.glassBorder }]}>
              <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                Selected:
              </AppText>
              <View style={styles.chipsContainerInline}>
                {selectedColors.map((color) => (
                  <View key={color} style={[styles.chipInline, { backgroundColor: colors.accentLight }]}>
                    <View
                      style={[
                        styles.colorChipIndicator,
                        { backgroundColor: getColorHex(color.toLowerCase()) },
                      ]}
                    />
                    <AppText variant="caption" style={{ color: colors.accent, marginRight: spacing.xs }}>
                      {color}
                    </AppText>
                    <TouchableOpacity
                      onPress={() => setSelectedColors(selectedColors.filter((v) => v !== color))}
                    >
                      <Icon name="close-circle" size={16} color={colors.accent} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.navigate(TAB_ROUTES.PROFILE)}
            style={styles.headerButton}
          >
            <Avatar size={32} source={user?.name ? { uri: `https://ui-avatars.com/api/?name=${user.name}` } : undefined} />
          </TouchableOpacity>
          <AppText variant="h1" style={{ fontWeight: '700', color: colors.textPrimary }}>
            Clothes Storage
          </AppText>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setSyncModalVisible(true)} style={styles.headerButton}>
              <Icon name="sync" size={24} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddCloth} style={styles.headerButton}>
              <Icon name="plus-circle" size={28} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <Animated.FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: spacing.lg, paddingBottom: 100 },
            items.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
          ListEmptyComponent={
            <EmptyState
              icon="tshirt-crew"
              title="No items yet"
              message="Add your first clothing item to get started"
            />
          }
          refreshing={isLoading}
          onRefresh={() => user && fetchItems(user.id)}
        />

        {/* Add Cloth Modal */}
        <Modal
          visible={addModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            resetForm();
            setAddModalVisible(false);
          }}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.glassBorder }]}>
                  <AppText variant="h1" style={{ fontWeight: '700' }}>
                    Add Cloth
                  </AppText>
                  <View style={styles.modalHeaderActions}>
                    <TouchableOpacity
                      style={[styles.saveHeaderButton, { backgroundColor: colors.accent, borderRadius: borderRadius.md }]}
                      onPress={handleSaveItem}
                    >
                      <AppText variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                        Save
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        resetForm();
                        setAddModalVisible(false);
                      }}
                      style={styles.closeButton}
                    >
                      <Icon name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {/* Image Section */}
                  <TouchableOpacity
                    style={[
                      styles.imageSection,
                      {
                        backgroundColor: colors.glassSurface,
                        borderColor: colors.glassBorder,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                    onPress={handlePickImage}
                  >
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={[styles.previewImage, { borderRadius: borderRadius.md }]}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Icon name="camera" size={48} color={colors.textSecondary} />
                        <AppText variant="body" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                          Tap to add image
                        </AppText>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Name */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Name *
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter item name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Category */}
                  {renderAutocompleteField(
                    'Category *',
                    selectedCategory,
                    'Select category',
                    categoryMenuVisible,
                    setCategoryMenuVisible,
                    Object.keys(clothingCategories) as ItemCategory[],
                    (value) => {
                      setSelectedCategory(value as ItemCategory);
                      setSelectedSubcategory([]);
                    }
                  )}

                  {/* Subcategory */}
                  {selectedCategory && (
                    renderAutocompleteField(
                      'Subcategory',
                      selectedSubcategory,
                      'Select subcategory',
                      subcategoryMenuVisible,
                      setSubcategoryMenuVisible,
                      clothingCategories[selectedCategory] || [],
                      () => {},
                      true,
                      selectedSubcategory
                    )
                  )}

                  {/* Colors - Color Picker */}
                  {renderColorPicker()}

                  {/* Materials */}
                  {renderAutocompleteField(
                    'Materials',
                    selectedMaterials,
                    'Select materials',
                    materialMenuVisible,
                    setMaterialMenuVisible,
                    materials,
                    () => {},
                    true,
                    selectedMaterials
                  )}

                  {/* Seasons */}
                  {renderAutocompleteField(
                    'Seasons',
                    selectedSeasons,
                    'Select seasons',
                    seasonMenuVisible,
                    setSeasonMenuVisible,
                    seasons,
                    () => {},
                    true,
                    selectedSeasons
                  )}

                  {/* Styles */}
                  {renderAutocompleteField(
                    'Styles',
                    selectedStyles,
                    'Select styles',
                    styleMenuVisible,
                    setStyleMenuVisible,
                    styleOptions,
                    () => {},
                    true,
                    selectedStyles
                  )}

                  {/* Brand */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Brand
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={brand}
                      onChangeText={setBrand}
                      placeholder="Enter brand name"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Size */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Size
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={size}
                      onChangeText={setSize}
                      placeholder="e.g., M, L, 32, etc."
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Source */}
                  {renderAutocompleteField(
                    'Source',
                    source,
                    'Select source',
                    sourceMenuVisible,
                    setSourceMenuVisible,
                    sourceOptions,
                    (value) => setSource(value as ClothSource)
                  )}

                  {/* Source Order ID */}
                  {source !== 'manual' && (
                    <View style={styles.fieldContainer}>
                      <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                        Order ID
                      </AppText>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: colors.glassSurface,
                            borderColor: colors.glassBorder,
                            color: colors.textPrimary,
                            borderRadius: borderRadius.sm,
                          },
                        ]}
                        value={sourceOrderId}
                        onChangeText={setSourceOrderId}
                        placeholder="Enter order ID"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                  )}

                  {/* Price */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Price
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="Enter price"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                    />
                  </View>

                  {/* Purchase Date */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Purchase Date
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={purchaseDate}
                      onChangeText={setPurchaseDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {/* Notes */}
                  <View style={styles.fieldContainer}>
                    <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                      Notes
                    </AppText>
                    <TextInput
                      style={[
                        styles.textInput,
                        styles.textArea,
                        {
                          backgroundColor: colors.glassSurface,
                          borderColor: colors.glassBorder,
                          color: colors.textPrimary,
                          borderRadius: borderRadius.sm,
                        },
                      ]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Add any additional notes"
                      placeholderTextColor={colors.textSecondary}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        {/* Detail Modal */}
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setDetailModalVisible(false);
            setSelectedItem(null);
            setEditMode(false);
            resetForm();
          }}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardView}
            >
              <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.glassBorder }]}>
                  <AppText variant="h1" style={{ fontWeight: '700' }}>
                    {editMode ? 'Edit Item' : 'Item Details'}
                  </AppText>
                  <View style={styles.modalHeaderActions}>
                    {!editMode && (
                      <>
                        <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
                          <Icon name="pencil" size={20} color={colors.accent} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteItem} style={styles.iconButton}>
                          <Icon name="delete" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        setDetailModalVisible(false);
                        setSelectedItem(null);
                        setEditMode(false);
                        resetForm();
                      }}
                    >
                      <Icon name="close" size={24} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {selectedItem && (
                    <>
                      {!editMode ? (
                        // View Mode
                        <>
                          <Image
                            source={{ uri: selectedItem.imageUri }}
                            style={[styles.detailImage, { borderRadius: borderRadius.md }]}
                            contentFit="cover"
                          />
                          <View style={styles.detailInfo}>
                            <AppText variant="h2" style={{ fontWeight: '700', marginBottom: spacing.sm }}>
                              {selectedItem.name || 'Unnamed Item'}
                            </AppText>
                            <View style={styles.detailRow}>
                              <AppText variant="body" color={colors.textSecondary}>Category:</AppText>
                              <AppText variant="body" style={{ marginLeft: spacing.sm }}>
                                {selectedItem.category.charAt(0).toUpperCase() + selectedItem.category.slice(1)}
                              </AppText>
                            </View>
                            {selectedItem.brand && (
                              <View style={styles.detailRow}>
                                <AppText variant="body" color={colors.textSecondary}>Brand:</AppText>
                                <AppText variant="body" style={{ marginLeft: spacing.sm }}>{selectedItem.brand}</AppText>
                              </View>
                            )}
                            {selectedItem.size && (
                              <View style={styles.detailRow}>
                                <AppText variant="body" color={colors.textSecondary}>Size:</AppText>
                                <AppText variant="body" style={{ marginLeft: spacing.sm }}>{selectedItem.size}</AppText>
                              </View>
                            )}
                            {selectedItem.colors.length > 0 && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Colors:
                                </AppText>
                                <View style={styles.chipsContainer}>
                                  {selectedItem.colors.map((color) => (
                                    <TagChip key={color} label={color} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                                  ))}
                                </View>
                              </View>
                            )}
                            {selectedItem.material && selectedItem.material.length > 0 && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Materials:
                                </AppText>
                                <View style={styles.chipsContainer}>
                                  {selectedItem.material.map((mat) => (
                                    <TagChip key={mat} label={mat} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                                  ))}
                                </View>
                              </View>
                            )}
                            {selectedItem.season && selectedItem.season.length > 0 && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Seasons:
                                </AppText>
                                <View style={styles.chipsContainer}>
                                  {selectedItem.season.map((season) => (
                                    <TagChip key={season} label={season} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                                  ))}
                                </View>
                              </View>
                            )}
                            {selectedItem.style && selectedItem.style.length > 0 && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Styles:
                                </AppText>
                                <View style={styles.chipsContainer}>
                                  {selectedItem.style.map((style) => (
                                    <TagChip key={style} label={style} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                                  ))}
                                </View>
                              </View>
                            )}
                            {selectedItem.tags && selectedItem.tags.length > 0 && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Tags:
                                </AppText>
                                <View style={styles.chipsContainer}>
                                  {selectedItem.tags.map((tag) => (
                                    <TagChip key={tag} label={tag} style={{ marginRight: spacing.xs, marginBottom: spacing.xs }} />
                                  ))}
                                </View>
                              </View>
                            )}
                            {selectedItem.price && (
                              <View style={styles.detailRow}>
                                <AppText variant="body" color={colors.textSecondary}>Price:</AppText>
                                <AppText variant="body" style={{ marginLeft: spacing.sm }}>${selectedItem.price.toFixed(2)}</AppText>
                              </View>
                            )}
                            {selectedItem.purchaseDate && (
                              <View style={styles.detailRow}>
                                <AppText variant="body" color={colors.textSecondary}>Purchase Date:</AppText>
                                <AppText variant="body" style={{ marginLeft: spacing.sm }}>{selectedItem.purchaseDate}</AppText>
                              </View>
                            )}
                            <View style={styles.detailRow}>
                              <AppText variant="body" color={colors.textSecondary}>Source:</AppText>
                              <AppText variant="body" style={{ marginLeft: spacing.sm }}>
                                {sourceOptions.find((s) => s.value === selectedItem.source)?.label || selectedItem.source}
                              </AppText>
                            </View>
                            {selectedItem.notes && (
                              <View style={styles.detailSection}>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
                                  Notes:
                                </AppText>
                                <AppText variant="body">{selectedItem.notes}</AppText>
                              </View>
                            )}
                          </View>
                        </>
                      ) : (
                        // Edit Mode
                        <>
                          <TouchableOpacity
                            style={[
                              styles.imageSection,
                              {
                                backgroundColor: colors.glassSurface,
                                borderColor: colors.glassBorder,
                                borderRadius: borderRadius.md,
                              },
                            ]}
                            onPress={handlePickImage}
                          >
                            {imageUri ? (
                              <Image
                                source={{ uri: imageUri }}
                                style={[styles.previewImage, { borderRadius: borderRadius.md }]}
                                contentFit="cover"
                              />
                            ) : (
                              <View style={styles.imagePlaceholder}>
                                <Icon name="camera" size={48} color={colors.textSecondary} />
                                <AppText variant="body" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                                  Tap to change image
                                </AppText>
                              </View>
                            )}
                          </TouchableOpacity>

                          {/* Same form fields as Add Modal */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Name *
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={name}
                              onChangeText={setName}
                              placeholder="Enter item name"
                              placeholderTextColor={colors.textSecondary}
                            />
                          </View>

                          {/* Category */}
                          {renderAutocompleteField(
                            'Category *',
                            selectedCategory,
                            'Select category',
                            categoryMenuVisible,
                            setCategoryMenuVisible,
                            Object.keys(clothingCategories) as ItemCategory[],
                            (value) => {
                              setSelectedCategory(value as ItemCategory);
                              setSelectedSubcategory([]);
                            }
                          )}

                          {/* Subcategory */}
                          {selectedCategory && (
                            renderAutocompleteField(
                              'Subcategory',
                              selectedSubcategory,
                              'Select subcategory',
                              subcategoryMenuVisible,
                              setSubcategoryMenuVisible,
                              clothingCategories[selectedCategory] || [],
                              () => {},
                              true,
                              selectedSubcategory
                            )
                          )}

                          {/* Colors */}
                          {renderAutocompleteField(
                            'Colors *',
                            selectedColors,
                            'Select colors',
                            colorMenuVisible,
                            setColorMenuVisible,
                            colorOptions,
                            () => {},
                            true,
                            selectedColors
                          )}

                          {/* Materials */}
                          {renderAutocompleteField(
                            'Materials',
                            selectedMaterials,
                            'Select materials',
                            materialMenuVisible,
                            setMaterialMenuVisible,
                            materials,
                            () => {},
                            true,
                            selectedMaterials
                          )}

                          {/* Seasons */}
                          {renderAutocompleteField(
                            'Seasons',
                            selectedSeasons,
                            'Select seasons',
                            seasonMenuVisible,
                            setSeasonMenuVisible,
                            seasons,
                            () => {},
                            true,
                            selectedSeasons
                          )}

                          {/* Styles */}
                          {renderAutocompleteField(
                            'Styles',
                            selectedStyles,
                            'Select styles',
                            styleMenuVisible,
                            setStyleMenuVisible,
                            styleOptions,
                            () => {},
                            true,
                            selectedStyles
                          )}

                          {/* Brand */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Brand
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={brand}
                              onChangeText={setBrand}
                              placeholder="Enter brand name"
                              placeholderTextColor={colors.textSecondary}
                            />
                          </View>

                          {/* Size */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Size
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={size}
                              onChangeText={setSize}
                              placeholder="e.g., M, L, 32, etc."
                              placeholderTextColor={colors.textSecondary}
                            />
                          </View>

                          {/* Source */}
                          {renderAutocompleteField(
                            'Source',
                            source,
                            'Select source',
                            sourceMenuVisible,
                            setSourceMenuVisible,
                            sourceOptions,
                            (value) => setSource(value as ClothSource)
                          )}

                          {/* Source Order ID */}
                          {source !== 'manual' && (
                            <View style={styles.fieldContainer}>
                              <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                                Order ID
                              </AppText>
                              <TextInput
                                style={[
                                  styles.textInput,
                                  {
                                    backgroundColor: colors.glassSurface,
                                    borderColor: colors.glassBorder,
                                    color: colors.textPrimary,
                                    borderRadius: borderRadius.sm,
                                  },
                                ]}
                                value={sourceOrderId}
                                onChangeText={setSourceOrderId}
                                placeholder="Enter order ID"
                                placeholderTextColor={colors.textSecondary}
                              />
                            </View>
                          )}

                          {/* Price */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Price
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={price}
                              onChangeText={setPrice}
                              placeholder="Enter price"
                              placeholderTextColor={colors.textSecondary}
                              keyboardType="decimal-pad"
                            />
                          </View>

                          {/* Purchase Date */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Purchase Date
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={purchaseDate}
                              onChangeText={setPurchaseDate}
                              placeholder="YYYY-MM-DD"
                              placeholderTextColor={colors.textSecondary}
                            />
                          </View>

                          {/* Notes */}
                          <View style={styles.fieldContainer}>
                            <AppText variant="body" style={[styles.label, { fontWeight: '600', marginBottom: spacing.sm }]}>
                              Notes
                            </AppText>
                            <TextInput
                              style={[
                                styles.textInput,
                                styles.textArea,
                                {
                                  backgroundColor: colors.glassSurface,
                                  borderColor: colors.glassBorder,
                                  color: colors.textPrimary,
                                  borderRadius: borderRadius.sm,
                                },
                              ]}
                              value={notes}
                              onChangeText={setNotes}
                              placeholder="Add any additional notes"
                              placeholderTextColor={colors.textSecondary}
                              multiline
                              numberOfLines={3}
                            />
                          </View>

                          <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.accent, borderRadius: borderRadius.md }]}
                            onPress={handleUpdateItem}
                          >
                            <AppText variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                              Update Item
                            </AppText>
                          </TouchableOpacity>
                        </>
                      )}
                    </>
                  )}
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        {/* Sync Modal */}
        <Modal
          visible={syncModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSyncModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.glassBorder }]}>
                <AppText variant="h1" style={{ fontWeight: '700' }}>
                  Sync from E-commerce
                </AppText>
                <TouchableOpacity onPress={() => setSyncModalVisible(false)}>
                  <Icon name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                  Connect your e-commerce accounts to automatically sync your clothing purchases
                </AppText>

                {['shopee', 'tiktokshop', 'lazada'].map((platform) => (
                  <TouchableOpacity
                    key={platform}
                    style={[
                      styles.syncButton,
                      {
                        backgroundColor: colors.glassSurface,
                        borderColor: colors.glassBorder,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                    onPress={() => handleSync(platform as 'shopee' | 'tiktokshop' | 'lazada')}
                  >
                    <Icon
                      name={platform === 'shopee' ? 'shopping' : platform === 'tiktokshop' ? 'video' : 'cart'}
                      size={24}
                      color={colors.accent}
                    />
                    <AppText variant="body" style={{ marginLeft: spacing.md, fontWeight: '600' }}>
                      {platform === 'shopee' ? 'Shopee' : platform === 'tiktokshop' ? 'TikTok Shop' : 'Lazada'}
                    </AppText>
                    <Icon name="chevron-right" size={24} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingConstants.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingConstants.sm,
  },
  listContent: {
    paddingTop: spacingConstants.sm,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    padding: spacingConstants.md,
    marginBottom: spacingConstants.md,
    borderRadius: borderRadiusConstants.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    marginRight: spacingConstants.md,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacingConstants.xs,
    paddingHorizontal: spacingConstants.xs,
    paddingVertical: spacingConstants.xs / 2,
    borderRadius: borderRadiusConstants.full,
    alignSelf: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    borderRadius: borderRadiusConstants.xl,
    marginHorizontal: spacingConstants.lg,
    marginTop: spacingConstants.lg,
    marginBottom: spacingConstants.lg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacingConstants.lg,
    paddingTop: spacingConstants.lg,
    paddingBottom: spacingConstants.md,
    borderBottomWidth: 1,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingConstants.sm,
  },
  saveHeaderButton: {
    paddingHorizontal: spacingConstants.md,
    paddingVertical: spacingConstants.xs,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: spacingConstants.xs,
    marginLeft: spacingConstants.xs,
  },
  iconButton: {
    padding: spacingConstants.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacingConstants.lg,
    paddingBottom: spacingConstants.xl,
  },
  imageSection: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: spacingConstants.lg,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContainer: {
    marginBottom: spacingConstants.lg,
  },
  label: {
    fontWeight: '600',
  },
  textInput: {
    height: 48,
    paddingHorizontal: spacingConstants.md,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    paddingTop: spacingConstants.md,
    textAlignVertical: 'top',
  },
  autocompleteInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacingConstants.md,
    paddingVertical: spacingConstants.xs,
    borderWidth: 1,
    flexWrap: 'wrap',
  },
  autocompleteMenu: {
    marginTop: spacingConstants.xs,
    maxHeight: 200,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuScroll: {
    maxHeight: 200,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacingConstants.md,
    borderBottomWidth: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacingConstants.sm,
  },
  chipsContainerInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: spacingConstants.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingConstants.sm,
    paddingVertical: spacingConstants.xs,
    borderRadius: borderRadiusConstants.full,
    marginRight: spacingConstants.xs,
    marginBottom: spacingConstants.xs,
  },
  chipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacingConstants.sm,
    paddingVertical: spacingConstants.xs / 2,
    borderRadius: borderRadiusConstants.full,
  },
  colorPickerContainer: {
    padding: spacingConstants.md,
    borderWidth: 1,
  },
  colorPickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacingConstants.sm,
    marginBottom: spacingConstants.md,
  },
  colorPickerItem: {
    width: 40,
    height: 40,
    borderRadius: borderRadiusConstants.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  colorPickerCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorsContainer: {
    marginTop: spacingConstants.sm,
    paddingTop: spacingConstants.sm,
    borderTopWidth: 1,
  },
  colorChipIndicator: {
    width: 12,
    height: 12,
    borderRadius: borderRadiusConstants.full,
    marginRight: spacingConstants.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    paddingVertical: spacingConstants.md,
    alignItems: 'center',
    marginTop: spacingConstants.lg,
  },
  detailImage: {
    width: '100%',
    height: 300,
    marginBottom: spacingConstants.lg,
  },
  detailInfo: {
    paddingBottom: spacingConstants.lg,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacingConstants.md,
  },
  detailSection: {
    marginBottom: spacingConstants.md,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacingConstants.md,
    marginBottom: spacingConstants.md,
    borderWidth: 1,
  },
});

