"use client"
import { useState } from 'react';
import styles from "./userAccount.module.css";
import { createNewAttribute, createNewType, deleteAttributeDB, deleteTypeDB, updateAttribute, updateType } from '../_lib/products';

export default function AdminTypesControl({ initialTypes, initialAttributes }) {

  const [types, setTypes] = useState(initialTypes);
  const [attributes, setAttributes] = useState(initialAttributes);


  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingAttributeId, setEditingAttributeId] = useState(null);


  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showAttributeForm, setShowAttributeForm] = useState(false);
  const [newTypeForm, setNewTypeForm] = useState({ name: '' });
  const [newAttributeForm, setNewAttributeForm] = useState({
    product_type_id: types[0]?.id || '',
    attribute_name: ''
  });

  const toggleTypeForm = () => {
    setShowTypeForm(!showTypeForm);
    setNewTypeForm({ name: '' }); 
  };

  const toggleAttributeForm = () => {
    setShowAttributeForm(!showAttributeForm);
    setNewAttributeForm({
      product_type_id: types[0]?.id || '',
      attribute_name: ''
    });
  };

  const handleNewTypeInputChange = (e) => {
    setNewTypeForm({ ...newTypeForm, [e.target.name]: e.target.value });
  };


  const handleNewAttributeInputChange = (e) => {
    setNewAttributeForm({ ...newAttributeForm, [e.target.name]: e.target.value });
  };


  const createType = async () => {
    try {
      console.log(newTypeForm);
      const newType = await createNewType(newTypeForm);
      setTypes([...types, newType]);
      setShowTypeForm(false);
      setNewTypeForm({ name: '' });
    } catch (error) {
      console.error('Failed to create type:', error);
    }
  };


  const createAttribute = async () => {
    try {

      const newAttribute = await createNewAttribute(newAttributeForm);
      setAttributes([...attributes, newAttribute]);
      setShowAttributeForm(false);
      setNewAttributeForm({
        product_type_id: types[0]?.id || '',
        attribute_name: ''
      });
    } catch (error) {
      console.error('Failed to create attribute:', error);
    }
  };


  const [typeEditForm, setTypeEditForm] = useState({ name: '' });
  const [attributeEditForm, setAttributeEditForm] = useState({
    product_type_id: '',
    attribute_name: ''
  });


  const startEditingType = (type) => {
    setEditingTypeId(type.id);
    setTypeEditForm({ name: type.name });
  };


  const startEditingAttribute = (attribute) => {
    setEditingAttributeId(attribute.id);
    setAttributeEditForm({
      product_type_id: attribute.product_type_id,
      attribute_name: attribute.attribute_name
    });
  };


  const cancelEditing = () => {
    setEditingTypeId(null);
    setEditingAttributeId(null);
  };


  const saveType = async (id) => {
    try {
      await updateType(id, typeEditForm);
      console.log(typeEditForm);
      setTypes(types.map(type =>
        type.id === id ? { ...type, name: typeEditForm.name } : type
      ));
      cancelEditing();
    } catch (error) {
      console.error('Failed to update type:', error);
    }
  };


  const saveAttribute = async (id) => {
    try {
      await updateAttribute(id, attributeEditForm);
      console.log("kek")
      console.log(attributeEditForm);
      console.log("lol");
      setAttributes(attributes.map(attr =>
        attr.id === id ? { ...attr, ...attributeEditForm } : attr
      ));
      console.log(attributes);
      cancelEditing();
    } catch (error) {
      console.error('Failed to update attribute:', error);
    }
  };


  const deleteType = async (id) => {
    try {
      await deleteTypeDB(id);
      setTypes(types.filter(type => type.id !== id));
      setAttributes(attributes.filter(attr => attr.product_type_id !== id));
    } catch (error) {
      console.error('Failed to delete type:', error);
    }
  };

  const deleteAttribute = async (id) => {
    try {
      await deleteAttributeDB(id);
      setAttributes(attributes.filter(attr => attr.id !== id));
    } catch (error) {
      console.error('Failed to delete attribute:', error);
    }
  };


  const handleTypeInputChange = (e) => {
    setTypeEditForm({ ...typeEditForm, [e.target.name]: e.target.value });
  };

  const handleAttributeInputChange = (e) => {
    console.log(e.target);
    setAttributeEditForm({ ...attributeEditForm, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.editorContainer}>
      {/* Product Types Table */}
      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h2>Типы товаров</h2>
          <button
            onClick={toggleTypeForm}
            className={styles.addButton}
          >
            {showTypeForm ? 'Отмена' : 'Добавить новый тип'}
          </button>
        </div>

        {/* New Type Form */}
        {showTypeForm && (
          <div className={styles.createForm}>
            <input
              type="text"
              name="name"
              placeholder="Type name"
              value={newTypeForm.name}
              onChange={handleNewTypeInputChange}
              className={styles.formInput}
            />
            <button
              onClick={createType}
              className={styles.saveButton}
              disabled={!newTypeForm.name.trim()}
            >
              Создать тип
            </button>
          </div>
        )}

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {types.map(type => (
              <tr key={type.id}>
                <td>{type.id}</td>
                <td>
                  {editingTypeId === type.id ? (
                    <input
                      type="text"
                      name="name"
                      value={typeEditForm.name}
                      onChange={handleTypeInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    type.name
                  )}
                </td>
                <td className={styles.actionsCell}>
                  {editingTypeId === type.id ? (
                    <>
                      <button
                        onClick={() => saveType(type.id)}
                        className={styles.saveButton}
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEditing}
                        className={styles.cancelButton}
                      >
                        Отменить
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditingType(type)}
                        className={styles.editButton}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteType(type.id)}
                        className={styles.deleteButton}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Type Attributes Table */}
      <div className={styles.tableSection}>
        <div className={styles.sectionHeader}>
          <h2>Свойства товаров</h2>
          <button
            onClick={toggleAttributeForm}
            className={styles.addButton}
            disabled={types.length === 0}
          >
            {showAttributeForm ? 'Отмена' : 'Добавить новое свойство'}
          </button>
        </div>
        {showAttributeForm && (
          <div className={styles.createForm}>
            <select
              name="product_type_id"
              value={newAttributeForm.product_type_id}
              onChange={handleNewAttributeInputChange}
              className={styles.formSelect}
            >
              {types.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="attribute_name"
              placeholder="Название свойства"
              value={newAttributeForm.attribute_name}
              onChange={handleNewAttributeInputChange}
              className={styles.formInput}
            />
            <button
              onClick={createAttribute}
              className={styles.saveButton}
              disabled={!newAttributeForm.attribute_name.trim()}
            >
              Создать свойство
            </button>
          </div>
        )}
        {/* <h2>Product Type Attributes</h2> */}
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Тип товара</th>
              <th>Название свойства</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {attributes.map(attr => (
              <tr key={attr.id}>
                <td>{attr.id}</td>
                <td>
                  {editingAttributeId === attr.id ? (
                    <select
                      name="product_type_id"
                      value={attributeEditForm.product_type_id}
                      onChange={handleAttributeInputChange}
                      className={styles.editSelect}
                    >
                      {types.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    types.find(t => t.id === Number(attr.product_type_id))?.name
                  )}
                </td>
                <td>
                  {editingAttributeId === attr.id ? (
                    <input
                      type="text"
                      name="attribute_name"
                      value={attributeEditForm.attribute_name}
                      onChange={handleAttributeInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    attr.attribute_name
                  )}
                </td>
                <td className={styles.actionsCell}>
                  {editingAttributeId === attr.id ? (
                    <>
                      <button
                        onClick={() => saveAttribute(attr.id)}
                        className={styles.saveButton}
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={cancelEditing}
                        className={styles.cancelButton}
                      >
                        Отменить
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditingAttribute(attr)}
                        className={styles.editButton}
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteAttribute(attr.id)}
                        className={styles.deleteButton}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};