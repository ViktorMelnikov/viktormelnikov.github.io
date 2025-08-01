/**
 * WebGPU Navigator Detailed Dump
 * Comprehensive analysis of navigator.gpu.requestAdapter and GPUAdapter properties
 * Based on WebGPU specification and Context7 documentation
 */

class WebGPUDumper {
    constructor() {
        this.adapter = null;
        this.dumpResults = [];
    }

    /**
     * Main dump function that analyzes navigator.gpu.requestAdapter
     */
    async dumpNavigatorGPU() {
        const results = {
            timestamp: new Date().toISOString(),
            webgpuAvailable: false,
            navigatorGPU: null,
            adapterTests: [],
            errors: []
        };

        try {
            // Check if WebGPU is available
            if (!navigator.gpu) {
                results.errors.push('WebGPU is not available in this browser');
                return results;
            }

            results.webgpuAvailable = true;
            results.navigatorGPU = {
                available: !!navigator.gpu,
                requestAdapter: typeof navigator.gpu.requestAdapter,
                requestAdapterFunction: navigator.gpu.requestAdapter.toString()
            };

            // Test different adapter request scenarios
            await this.testAdapterRequests(results);

        } catch (error) {
            results.errors.push(`Error during dump: ${error.message}`);
        }

        return results;
    }

    /**
     * Test various adapter request configurations
     */
    async testAdapterRequests(results) {
        const testCases = [
            {
                name: 'Default Request',
                options: {}
            },
            {
                name: 'Low Power Preference',
                options: { powerPreference: 'low-power' }
            },
            {
                name: 'High Performance Preference',
                options: { powerPreference: 'high-performance' }
            },
            {
                name: 'Force Fallback False',
                options: { forceFallback: false }
            },
            {
                name: 'Force Fallback True',
                options: { forceFallback: true }
            },
            {
                name: 'Compatibility Mode',
                options: { featureLevel: 'compatibility' }
            },
            {
                name: 'XR Compatible',
                options: { xrCompatible: true }
            },
            {
                name: 'Combined Options',
                options: { 
                    powerPreference: 'high-performance',
                    forceFallback: false,
                    xrCompatible: true
                }
            }
        ];

        for (const testCase of testCases) {
            try {
                const adapter = await navigator.gpu.requestAdapter(testCase.options);
                
                const adapterInfo = {
                    testName: testCase.name,
                    options: testCase.options,
                    success: !!adapter,
                    adapter: null
                };

                if (adapter) {
                    adapterInfo.adapter = await this.analyzeAdapter(adapter);
                    
                    // Store first successful adapter for further testing
                    if (!this.adapter) {
                        this.adapter = adapter;
                    }
                }

                results.adapterTests.push(adapterInfo);

            } catch (error) {
                results.adapterTests.push({
                    testName: testCase.name,
                    options: testCase.options,
                    success: false,
                    error: error.message,
                    stack: error.stack
                });
            }
        }
    }

    /**
     * Analyze a GPU adapter - extract only main properties
     */
    async analyzeAdapter(adapter) {
        const analysis = {
            features: Array.from(adapter.features),
            limits: this.extractLimits(adapter.limits),
            isFallbackAdapter: adapter.isFallbackAdapter || 'Not available',
            info: null
        };

        try {
            // Get adapter info using the info property
            const adapterInfo = await adapter.info;
            analysis.info = {
                vendor: adapterInfo.vendor,
                architecture: adapterInfo.architecture,
                device: adapterInfo.device,
                description: adapterInfo.description
            };
        } catch (error) {
            analysis.info = {
                error: error.message
            };
        }

        return analysis;
    }

    /**
     * Extract limits from adapter
     */
    extractLimits(limits) {
        const extracted = {};
        for (const [key, value] of Object.entries(limits)) {
            extracted[key] = value;
        }
        return extracted;
    }

    /**
     * Generate comprehensive report
     */
    async generateFullReport() {
        const report = {
            timestamp: new Date().toISOString(),
            navigatorGPU: await this.dumpNavigatorGPU()
        };

        return report;
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        return JSON.stringify(this.dumpResults, null, 2);
    }

    /**
     * Clear all stored data
     */
    clear() {
        this.adapter = null;
        this.dumpResults = [];
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.WebGPUDumper = WebGPUDumper;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebGPUDumper;
} 