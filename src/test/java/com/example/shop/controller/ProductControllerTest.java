package com.example.shop.controller;

import com.example.shop.model.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration smoke tests for ProductController — verifies the existing REST contract
 * remains unchanged after the search-box feature is added (NFR5).
 */
@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ProductController controller;

    @Test
    void allProducts_returnsNonEmptyList() {
        List<Product> products = controller.all();
        assertThat(products).isNotEmpty();
    }

    @Test
    void allProducts_containsExpectedFields() {
        List<Product> products = controller.all();
        Product first = products.get(0);
        assertThat(first.id()).isNotNull();
        assertThat(first.name()).isNotBlank();
        assertThat(first.price()).isGreaterThan(0);
        assertThat(first.image()).isNotBlank();
    }

    @Test
    void getApiProducts_returns200WithJsonArray() throws Exception {
        mockMvc.perform(get("/api/products"))
               .andExpect(status().isOk())
               .andExpect(content().contentTypeCompatibleWith("application/json"))
               .andExpect(jsonPath("$").isArray())
               .andExpect(jsonPath("$.length()").value(4));
    }

    @Test
    void getApiProducts_firstProductIsLaptop() throws Exception {
        mockMvc.perform(get("/api/products"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].name").value("Laptop"))
               .andExpect(jsonPath("$[0].price").value(55999));
    }
}
