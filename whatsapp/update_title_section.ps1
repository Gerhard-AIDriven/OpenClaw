$file = "C:\Users\gstim\.openclaw\workspace\whatsapp\report-engine-v2.js"
$content = Get-Content $file -Raw

$oldSection = @"  <!-- LINZ Title Data -->
  `${linzData ? `
  <section class="content-section">
    <div class="container">
      <h2 class="section-title">LINZ Title Information</h2>
      <div class="data-grid">
        <div class="data-card">
          <h3>📄 Title Details</h3>
          <table class="data-table">
            <tr>
              <td>Title Number</td>
              <td>${linzData.titleNumber || 'N/A'}</td>
            </tr>
            <tr>
              <td>Legal Description</td>
              <td>${linzData.legalDescription || 'N/A'}</td>
            </tr>
            <tr>
              <td>Area</td>
              <td>${linzData.area || 'N/A'}</td>
            </tr>
            <tr>
              <td>Ownership</td>
              <td>${linzData.ownership || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div class="data-card">
          <h3>⛓️ Easements</h3>
          ${linzData.easements && linzData.easements.length > 0 ? `
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
  ` : ''}"@

$newSection = @"  <!-- Property Title Information (from MyProperty or LINZ) -->
  `${linzData || (ratesData && ratesData.myPropertyData) ? `
  <section class="content-section">
    <div class="container">
      <h2 class="section-title">Property Title Information</h2>
      <div class="data-grid">
        <div class="data-card">
          <h3>📄 Title Details</h3>
          <table class="data-table">
            `${ratesData && ratesData.myPropertyData?.property?.record_of_title ? `
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
            `${ratesData && ratesData.myPropertyData?.property?.legal_description ? `
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
            `${ratesData && ratesData.myPropertyData?.property?.area_ha ? `
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
            `${ratesData && ratesData.myPropertyData?.property?.valuation_number ? `
            <tr>
              <td>Valuation Number</td>
              <td>${ratesData.myPropertyData.property.valuation_number}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div class="data-card">
          <h3>⛓️ Easements</h3>
          `${ratesData && ratesData.myPropertyData?.easements && ratesData.myPropertyData.easements.length > 0 ? `
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
  ` : ''}"@

$content = $content.Replace($oldSection, $newSection)
Set-Content $file $content -NoNewline
Write-Host "✅ Updated title section to use MyProperty data"
