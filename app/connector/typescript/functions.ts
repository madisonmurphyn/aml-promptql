/**
 * SDN (Specially Designated Nationals) API Integration
 * Connects OFAC sanctions data to Aurelia Bank's AML supergraph
 */

// Type definitions for SDN data structures
interface SdnRecord {
  id: string;
  schema: string;
  name: string;
  aliases: string;
  birth_date: string;
  countries: string;
  addresses: string;
  identifiers: string;
  sanctions: string;
  phones: string;
  emails: string;
  dataset: string;
  first_seen: string;
  last_seen: string;
  last_change: string;
}

interface SdnDataResponse {
  success: boolean;
  data: SdnRecord[];
  count: number;
  error?: string;
}

interface CustomerCheckResponse {
  customerName: string;
  isSDN: boolean | null;
  matchCount: number;
  matches: SdnRecord[];
  riskLevel: string;
  error?: string;
}

interface BulkCheckSummary {
  critical: number;
  clear: number;
  unknown: number;
}

interface BulkCheckResponse {
  success: boolean;
  totalChecked: number;
  flaggedCount: number;
  results: CustomerCheckResponse[];
  summary: BulkCheckSummary;
  error?: string;
}

/**
 * Fetches SDN (Specially Designated Nationals) data from the custom API
 * This function queries sanctioned individuals and entities to help identify
 * potential AML risks in the bank's customer base
 */
export async function getSdnData(
  name?: string,
  country?: string,
  limit: number = 100
): Promise<SdnDataResponse> {
  const API_BASE_URL = process.env.SDN_API_URL || 'https://sdn-api-w7wr.onrender.com';
  
  try {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (country) params.append('country', country);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_BASE_URL}/getsdn?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`SDN API request failed: ${response.statusText}`);
    }
    
    const data = await response.json() as SdnRecord[];
    
    return {
      success: true,
      data: data,
      count: Array.isArray(data) ? data.length : 0,
    };
  } catch (error) {
    console.error('Error fetching SDN data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
    };
  }
}

/**
 * Check if a customer name matches any SDN entries
 * Useful for real-time compliance checks during transaction processing
 */
export async function checkCustomerAgainstSdn(
  customerName: string,
  fuzzyMatch: boolean = true
): Promise<CustomerCheckResponse> {
  const API_BASE_URL = process.env.SDN_API_URL || 'https://sdn-api-w7wr.onrender.com';
  
  try {
    const params = new URLSearchParams();
    params.append('name', customerName);
    if (fuzzyMatch) params.append('fuzzy', 'true');
    
    const url = `${API_BASE_URL}/getsdn?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`SDN check failed: ${response.statusText}`);
    }
    
    const matches = await response.json() as SdnRecord[];
    const hasMatch = Array.isArray(matches) && matches.length > 0;
    
    return {
      customerName,
      isSDN: hasMatch,
      matchCount: Array.isArray(matches) ? matches.length : 0,
      matches: matches,
      riskLevel: hasMatch ? 'CRITICAL' : 'CLEAR',
    };
  } catch (error) {
    console.error('Error checking customer against SDN list:', error);
    return {
      customerName,
      isSDN: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      matches: [],
      matchCount: 0,
      riskLevel: 'UNKNOWN',
    };
  }
}

/**
 * Bulk check multiple customers against SDN list
 * Efficient for batch processing of customer base
 */
export async function bulkCheckSdn(
  customerNames: string[]
): Promise<BulkCheckResponse> {
  if (!Array.isArray(customerNames) || customerNames.length === 0) {
    return {
      success: false,
      error: 'customerNames must be a non-empty array',
      results: [],
      totalChecked: 0,
      flaggedCount: 0,
      summary: {
        critical: 0,
        clear: 0,
        unknown: 0,
      },
    };
  }
  
  try {
    const checkPromises = customerNames.map(name => 
      checkCustomerAgainstSdn(name, true)
    );
    
    const results = await Promise.all(checkPromises);
    
    const flaggedCustomers = results.filter(r => r.isSDN === true);
    
    return {
      success: true,
      totalChecked: results.length,
      flaggedCount: flaggedCustomers.length,
      results: results,
      summary: {
        critical: flaggedCustomers.length,
        clear: results.filter(r => r.riskLevel === 'CLEAR').length,
        unknown: results.filter(r => r.riskLevel === 'UNKNOWN').length,
      },
    };
  } catch (error) {
    console.error('Error in bulk SDN check:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      results: [],
      totalChecked: 0,
      flaggedCount: 0,
      summary: {
        critical: 0,
        clear: 0,
        unknown: 0,
      },
    };
  }
}