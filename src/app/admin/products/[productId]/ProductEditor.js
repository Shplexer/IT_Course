// components/ProductEditor/ProductEditor.jsx
"use client"
import { useState, useEffect } from 'react';
import styles from './ProductEditor.module.css';
import {  getAttributesById, saveProduct, uploadProductImage } from '@/app/_lib/products';
import Link from 'next/link';

export default function ProductEditor({
  product,
  productTypes,
}) {
  const [showSuccess, setShowSuccess] = useState(false);
  const onSave = async (productData) => {
    // Implement the logic to save the product data
    console.log('Product saved:', productData);
    try {
      await saveProduct(productData);
    } finally {
      setShowSuccess(true);
    }
  }
  const onCancel = () => {
    // Implement the logic to cancel the product editing
    console.log('Product editing cancelled');
  }
  const onImageUpload = async (file) => {
    try {
      const result = await uploadProductImage(file)
      if (!result.success) {
        throw new Error(result.error || 'Image upload failed')
      }
      return result
    } catch (error) {
      //  alert(error);
      throw new Error(error);
    }
  }
  const fetchTypeAttributes = async (typeId) => {
    if (!typeId) {
      setTypeAttributes([]);
      return;
    }

    try {
      const data = await getAttributesById(typeId);
      setTypeAttributes(data);

      // Merge with existing attributes
      setFormData(prev => {
        const existingAttributes = prev.attributes || [];

        const newAttributes = data.map(attr => {
          // Find if this attribute already exists in product
          const existingAttr = existingAttributes.find(a => a.name === attr.attribute_name);
          return {
            name: attr.attribute_name,
            value: existingAttr ? existingAttr.value : ""
          };
        });

        return {
          ...prev,
          attributes: newAttributes
        };
      });
    } catch (error) {
      console.error('Error fetching type attributes:', error);
      setTypeAttributes([]);
    }
  };
  const [typeAttributes, setTypeAttributes] = useState([]);
  // State for form fields
  const [formData, setFormData] = useState({
    id: product?.product_id || '',
    name: product?.name || '',
    description: product?.description || '',
    shortDescription: product?.short_description || '',
    price: product?.price || 0,
    isOnSale: product?.is_on_sale || false,
    salePrice: product?.saleprice || 0,
    amount: product?.amount || 0,
    productType: product?.type_id || '',
    properties: product?.properties || [],
    picId: product?.pic_id || null,
    picPath: product?.pic_path || '',
    attributes: []
  });

  // State for image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.pic_path || '');

  useEffect(() => {
    if (product) {
      console.log("Product data:", product);

      const properties = typeof product.properties === 'string'
        ? JSON.parse(product.properties)
        : product.properties || [];

      // Initialize attributes from product if they exist
      const initialAttributes = product.attributes || [];

      setFormData(prev => ({
        ...prev,
        properties,
        attributes: initialAttributes
      }));

      // Fetch type attributes
      if (product.type_id) {
        fetchTypeAttributes(product.type_id);
      }
    }
  }, [product]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If product type changed, fetch its attributes
    if (name === 'productType') {
      fetchTypeAttributes(value);
    }
  };
  // Handle property changes
  const handlePropertyChange = (index, field, value) => {
    const newProperties = [...formData.properties];
    newProperties[index][field] = value;
    setFormData(prev => ({
      ...prev,
      properties: newProperties
    }));
  };

  // Handle attribute changes
  const handleAttributeChange = (index, value) => {
    const attributeName = typeAttributes[index]?.attribute_name;
    if (!attributeName) return;

    const newAttributes = [...formData.attributes];
    newAttributes[index] = { name: attributeName, value };
    setFormData(prev => ({ ...prev, attributes: newAttributes }));
  };
  // Add new property
  const addProperty = () => {
    setFormData(prev => ({
      ...prev,
      properties: [...prev.properties, { name: '', value: '' }]
    }));
  };

  // Remove property
  const removeProperty = (index) => {
    const newProperties = [...formData.properties];
    newProperties.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      properties: newProperties
    }));
  };

  // Handle image selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log(file, "uploaded image")
    if (file) {
      let uploadResult;
      try{
        uploadResult = await onImageUpload(file)
      } catch (error) {
        alert(error);
        return;
      }
      setImageFile(uploadResult.picPath);
      setImagePreview(uploadResult.picPath);
      // setFormData();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    let newPicPath = formData.picPath

    // // Upload new image if selected
    if (imageFile) {
      newPicPath = imageFile;
    } else {
      newPicPath = product?.pic_path || '';
    }
    console.log(newPicPath);
    // }

    // Prepare the product data to save
    const productToSave = {
      ...formData,
      picPath: newPicPath,
      productType: formData.productType
    }
    console.log("Before onSave:", newPicPath);
    await onSave(productToSave, newPicPath);
  }

  return (
    <div className={styles.editorContainer}>
      <h2 className={styles.editorTitle}>
        {product ? 'Редактирование товара' : 'Добавление товара'}
      </h2>

      <form onSubmit={handleSubmit} className={styles.productForm}>
        {/* Basic Information Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Основная информация</h3>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Название продукта</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="shortDescription" className={styles.label}>Краткое описание</label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`}
              rows="3"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Полное описание</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`${styles.input} ${styles.textarea}`}
              rows="6"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="productType" className={styles.label}>Тип товара</label>
            <select
              id="productType"
              name="productType"
              value={formData.productType}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Выберите тип товара</option>
              {productTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Стоимость и наличие</h3>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>Цена</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                Скидка
              </label>
            </div>

            {formData.isOnSale && (
              <div className={styles.formGroup}>
                <label htmlFor="salePrice" className={styles.label}>Цена по скидке</label>
                <input
                  type="number"
                  id="salePrice"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  className={styles.input}
                  min="0"
                  step="0.01"
                  required={formData.isOnSale}
                />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>Кол-во на складе</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={styles.input}
              min="0"
              required
            />
          </div>
        </div>

        {/* Image Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Изображение товара</h3>

          <div className={styles.imageUploadContainer}>
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img
                  src={`/products/${imagePreview}`}


                  alt="Товар"
                  className={styles.previewImage}
                />
              </div>
            )}

            <div className={styles.uploadControls}>
              <label htmlFor="productImage" className={styles.uploadLabel}>
                Выберите изображение
                <input
                  type="file"
                  id="productImage"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Уникальные характеристики товара</h3>

          {formData.properties.map((property, index) => (
            <div key={index} className={styles.propertyRow}>
              <input
                type="text"
                value={property.name}
                onChange={(e) => handlePropertyChange(index, 'name', e.target.value)}
                className={`${styles.input} ${styles.propertyInput}`}
                placeholder="Property name"
              />
              <input
                type="text"
                value={property.value}
                onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                className={`${styles.input} ${styles.propertyInput}`}
                placeholder="Property value"
              />
              <button
                type="button"
                onClick={() => removeProperty(index)}
                className={styles.removeButton}
              >
                Удалить
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addProperty}
            className={styles.addButton}
          >
            Добавить характеристику
          </button>
        </div>

        {/* Attributes Section */}
        {typeAttributes.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Характеристики типа товара</h3>
            {typeAttributes.map((attr, index) => (
              <div key={index} className={styles.formGroup}>
                <label className={styles.label}>{attr.attribute_name}</label>
                <input
                  type="text"
                  value={formData.attributes[index]?.value || ""}
                  onChange={(e) => handleAttributeChange(index, e.target.value)}
                  className={styles.input}
                />
              </div>
            ))}
          </div>
        )}

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Отмена
          </button>
          <button type="submit" className={styles.saveButton}>
            Сохранить товар
          </button>
        </div>
      </form>
      {showSuccess && (
        <SuccessOverlay
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}

function SuccessOverlay({ onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <p>Данные успешно сохранены!</p>
        <Link href='/userAccount'>
          <button onClick={onClose} className={styles.closeButton}>
            Закрыть
          </button>
        </Link>
      </div>
    </div>
  );
}