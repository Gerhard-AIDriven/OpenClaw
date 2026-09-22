import re

file_path = "C:\\Users\\gstim\\.openclaw\\workspace\\whatsapp\\report-engine-v2.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the LINZ Title section
old_pattern = r'<!-- LINZ Title Data -->\s*\$\{linzData \? `[\s\S]*?<!-- Hazards Data -->'

new_section = """<!-- Property Title Information (from MyProperty or LINZ) -->
  ${linzData || (ratesData && ratesData.myPropertyData) ? `
  <section class="content-section">
    <div class="container">
      <h2 class="section-title">Property Title Information</h2>
      <div class="data-grid">
        <div class="data-card">
          <h3>📄 Title Details</h3>
          <table class="data-table">
            ${ratesData && ratesData.myPropertyData?.property?.record_of_title ? `
            <tr>
              <td>Title Number (Record of Title)</td>
              <td>${ratesData.myPropertyData.property.record_of_title}</td>
            </tr>
            ` : linzData?.titleNumber ? `
            <tr>
              <td>Title Number</td>
              <td>${linzData.titleNumber || 'N/A'}</td>
            </tr>
            ` : ''}
            ${ratesData && ratesData.myPropertyData?.property?.legal_description ? `
            <tr>
              <td>Legal Description</td>
              <td>${ratesData.myPropertyData.property.legal_description}</td>
            </tr>
            ` : linzData?.legalDescription ? `
            <tr>
              <td>Legal Description</td>
              <td>${linzData.legalDescription || 'N/A'}</td>
            </tr>
            ` : ''}
            ${ratesData && ratesData.myPropertyData?.property?.area_ha ? `
            <tr>
              <td>Area</td>
              <td>${ratesData.myPropertyData.property.area_ha} ha</td>
            </tr>
            ` : linzData?.area ? `
            <tr>
              <td>Area</td>
              <td>${linzData.area || 'N/A'}</td>
            </tr>
            ` : ''}
            ${ratesData && ratesData.myPropertyData?.property?.valuation_number ? `
            <tr>
              <td>Valuation Number</td>
              <td>${ratesData.myPropertyData.property.valuation_number}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div class="data-card">
          <h3>⛓️ Easements</h3>
          ${ratesData && ratesData.myPropertyData?.easements && ratesData.myPropertyData.easements.length > 0 ? `
            <ul class="hazards-list">
              ${ratesData.myPropertyData.easements.map(easement => `
                <li>
                  <span class="hazard-icon">⛓️</span>
                  <div>
                    <strong>${easement.type || 'Easement'}</strong><br>
                    <small>${easement.description || 'No description available'}</small>
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : linzData?.easements && linzData.easements.length > 0 ? `
            <ul class="hazards-list">
              ${linzData.easements.map(easement => `
                <li>
                  <span class="hazard-icon">⛓️</span>
                  <div>
                    <strong>${easement.type || 'Easement'}</strong><br>
                    <small>${easement.description || 'No description available'}</small>
                  </div>
                </li>
              `).join('')}
            </ul>
          ` : '<p style="color: var(--muted); padding: 20px 0;">✓ No easements registered on this title.</p>'}
        </div>
      </div>
    </div>
  </section>
  ` : ''}
  
  <!-- Hazards Data -->"""

# Simple string replacement
old_section_start = "<!-- LINZ Title Data -->"
old_section_end = "<!-- Hazards Data -->"

start_idx = content.find(old_section_start)
end_idx = content.find(old_section_end, start_idx)

if start_idx != -1 and end_idx != -1:
    # Include the Hazards Data comment in the replacement
    end_idx = content.find('\n', end_idx) + 1
    content = content[:start_idx] + new_section + content[end_idx:]
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Updated title section to use MyProperty data")
else:
    print("❌ Could not find the section to replace")
    print(f"Start found: {start_idx != -1}, End found: {end_idx != -1}")
