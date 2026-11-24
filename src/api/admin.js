import client from './client';

// Todas as chamadas do admin num só lugar. As rotas antigas do servidor ficam em /api/...
// e /cliente/...; as novas (criadas para este painel) ficam em /api/admin/...
// Algumas rotas antigas respondem { success, data }, outras os dados direto: devolve sempre os dados
const data = (p) => p.then((r) => {
    const body = r.data;
    return body && typeof body === 'object' && !Array.isArray(body) && 'success' in body && 'data' in body ? body.data : body;
});
const form = (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
        else fd.append(k, v);
    });
    return fd;
};

const api = {
    // Sessão
    login: (email, password) => data(client.post('/api/company-authenticate', { email, password })),
    me: () => data(client.get('/api/admin/me')),
    changePassword: (current, password) => data(client.put('/api/admin/me/password', { current, password })),

    // Painel
    dashboard: () => data(client.get('/api/admin/dashboard')),

    // Pedidos e clientes
    ordersPending: () => data(client.get('/cliente/orders-pendent-adm')),
    ordersFinished: () => data(client.get('/cliente/orders-finished-adm')),
    order: (id) => data(client.get(`/api/admin/orders/${id}`)),
    updateOrder: (id, fields) => data(client.put(`/cliente/orders/${id}`, fields)),
    clients: () => data(client.get('/cliente/client')),

    // Produtos
    adminProducts: () => data(client.get('/api/admin/products')),
    adminProduct: (id) => data(client.get(`/api/admin/products/${id}`)),
    saveSheet: (id, fields) => data(client.put(`/api/admin/products/${id}/sheet`, fields)),
    saveFeatures: (id, features) => data(client.put(`/api/admin/products/${id}/features`, features)),
    setCoverPhoto: (id, imgId) => data(client.post(`/api/admin/products/${id}/photos/${imgId}/cover`)),
    products: () => data(client.get('/api/product-all-adm')),
    productSearch: (text) => data(client.get(`/api/product-only-adm/${encodeURIComponent(text)}`)),
    createProduct: (fields) => data(client.post('/api/product', fields)),
    updateProduct: (fields) => data(client.put('/api/product', fields)),
    deleteProduct: (id) => data(client.delete(`/api/product/${id}`)),
    uploadPhotos: (product, files) => data(client.post('/api/product-foto', form({ fotos: files }), {
        params: { Product_ID: product.Product_ID, Product_Code: product.Product_Code || product.Product_ID, name: product.Product_Slug || product.Product_Name },
    })),
    deletePhoto: (id) => data(client.delete(`/api/product-img/${id}`)),
    uploadProductBanner: (productId, file) => data(client.post('/api/upload-product-banner', form({ file, Product_ID: productId }))),
    deleteProductBanner: (id) => data(client.delete(`/api/product-banner/${id}`)),
    productVideos: (productId) => data(client.get(`/api/product-video/${productId}`)),
    addProductVideo: (productId, url) => data(client.post('/api/product-video', { Product_ID: productId, url })),
    deleteProductVideo: (id) => data(client.delete(`/api/product-video/${id}`)),
    saveFeature: (fields) => data(client.put('/api/main-factures', fields)),

    // Instalações
    installations: () => data(client.get('/api/installation')),
    createInstallation: (fields) => data(client.post('/api/installation', fields)),
    updateInstallation: (id, fields) => data(client.put(`/api/installation/${id}`, fields)),
    deleteInstallation: (id) => data(client.delete(`/api/installation/${id}`)),
    linkInstallation: (productId, installationId) => data(client.post('/api/product-installation', { Product_ID: productId, Installation_ID: installationId })),
    unlinkInstallation: (productId, installationId) => data(client.delete(`/api/product-installation/${productId}/${installationId}`)),

    // Categorias
    categories: () => data(client.get('/api/category-adm')),
    createCategory: (fields) => data(client.post('/api/category-adm', fields)),
    updateCategory: (id, fields) => data(client.put(`/api/category-adm/${id}`, fields)),
    deleteCategory: (id) => data(client.delete(`/api/category-adm/${id}`)),
    createSubCategory: (fields) => data(client.post('/api/sub-category-adm', fields)),
    updateSubCategory: (id, fields) => data(client.put(`/api/sub-category-adm/${id}`, fields)),
    deleteSubCategory: (id) => data(client.delete(`/api/sub-category-adm/${id}`)),

    // Marcas
    brands: () => data(client.get('/api/brands')),
    createBrand: (fields) => data(client.post('/api/brands', fields)),
    updateBrand: (fields) => data(client.put('/api/brands', fields)),
    deleteBrand: (id) => data(client.delete(`/api/brands/${id}`)),
    uploadBrandLogo: (id, file) => data(client.post(`/api/admin/brands/${id}/image`, form({ image: file }))),

    // Layout do site
    menus: () => data(client.get('/api/all-navbar')),
    createMenu: (fields) => data(client.post('/api/find-menu-navbar', { subMenus: [], ...fields })),
    createSubMenus: (menuLabel, subMenus) => data(client.post('/api/find-menu-navbar', { label: menuLabel, subMenus })),
    updateMenu: (fields) => data(client.put('/api/menu-navbar', fields)),
    deleteMenu: (menu) => data(client.delete(`/api/menu-navbar/${menu.id_layout_navbar}`, {
        data: { id_layout_navbar: menu.id_layout_navbar, ids_submenus: (menu.subMenus || menu.layout_submenus || []).map((s) => s.id_layout_submenu) },
    })),
    deleteSubMenu: (id) => data(client.delete(`/api/submenus-navbar/${id}`)),

    banners: () => data(client.get('/api/banner-home').catch((e) => (e?.response?.status === 404 ? { data: [] } : Promise.reject(e)))),
    uploadBanner: (file, url, alt) => data(client.post('/api/banner-home', form({ 'banner-home': file, url, alt }))),
    updateBanner: (fields) => data(client.put('/api/banner-home', fields)),
    deleteBanner: (id) => data(client.delete(`/api/banner-home/${id}`)),
    uploadBannerMobile: (archiveId, file, url, alt) => data(client.post('/api/banner-home-mobile', form({ 'banner-home-mobile': file, id_archives: archiveId, url, alt }))),
    updateBannerMobile: (fields) => data(client.put('/api/banner-home-mobile', fields)),
    deleteBannerMobile: (id) => data(client.delete(`/api/banner-home-mobile/${id}`)),

    logo: () => data(client.get('/api/admin/logo')),
    uploadLogo: (file) => data(client.post('/api/logo', form({ logo: file }))),

    subcategoryIcons: () => data(client.get('/api/layout-subcategory')),
    createSubcategoryIcon: (fields) => data(client.post('/api/layout-subcategory', fields)),
    updateSubcategoryIcon: (fields) => data(client.put('/api/layout-subcategory', fields)),
    deleteSubcategoryIcon: (id) => data(client.delete(`/api/layout-subcategory/${id}`)),
    uploadSubcategoryIcon: (id, file) => data(client.post('/api/layout-subcategory-file', form({ icon: file, id_layout_subcategories: id }))),

    layoutEnvironments: () => data(client.get('/api/admin/layout-environment')),
    createLayoutEnvironment: (fields) => data(client.post('/api/environment-adm-layout', fields)),
    updateLayoutEnvironment: (fields) => data(client.put('/api/environment-adm-layout', fields)),
    deleteLayoutEnvironment: (id) => data(client.delete(`/api/environment-adm-layout/${id}`)),
    uploadLayoutEnvironment: (id, file) => data(client.post('/api/upload-environment-adm-layout', form({ icon: file, id_layout_environment: id }))),

    footer: () => data(client.get('/api/layout-footer')),
    createFooter: (label) => data(client.post('/api/layout-footer', { label })),
    updateFooter: (id, label) => data(client.put('/api/layout-footer', { id_layout_Footer: id, label })),
    deleteFooter: (id) => data(client.delete(`/api/layout-footer/${id}`)),

    institutional: () => data(client.get('/api/texts-institutional')),
    createInstitutional: (label) => data(client.post('/api/texts-institutional', { label })),
    updateInstitutional: (id, label) => data(client.put('/api/texts-institutional', { id_texts_institutional: id, label })),
    deleteInstitutional: (id) => data(client.delete(`/api/texts-institutional/${id}`)),

    // iSales
    isalesStatus: () => data(client.get('/api/admin/isales/status')),
    isalesProducts: (linked, q = '') => data(client.get('/api/admin/isales/products', { params: { linked: linked ? 1 : 0, q } })),
    isalesItem: (id) => data(client.get('/api/admin/isales/catalog', { params: { id } })),
    isalesCatalog: (q, refresh = false) => data(client.get('/api/admin/isales/catalog', { params: { q, refresh: refresh ? 1 : undefined } })),
    linkIsales: (productId, isalesId) => data(client.put(`/api/admin/products/${productId}/isales`, { isales_id: isalesId })),
    unlinkIsales: (productId) => data(client.delete(`/api/admin/products/${productId}/isales`)),
    isalesSync: () => data(client.post('/api/admin/isales/sync')),

    // Avisos de estoque
    stockAlerts: (status) => data(client.get('/api/admin/stock-alerts', { params: { status } })),
    setStockAlertNotified: (id, notified) => data(client.patch(`/api/admin/stock-alerts/${id}`, { notified })),
    deleteStockAlert: (id) => data(client.delete(`/api/admin/stock-alerts/${id}`)),
    sendStockAlerts: () => data(client.post('/api/admin/stock-alerts/send')),
};

export default api;
