<script>
 import SubContainerCommon from "../components/SubContainerCommon.svelte"

 let title = "Experience"
 let name = "experience"
 let body = `
  <div>
    <ul>
      <li><strong>24 years of professional experience in the US Navy:</strong>
        <ul>
          <li><strong>Information Systems Security Manager / Network administrator 10+ years:</strong></li>
          <ul>
            <li>COMPTIA Security+ certified 7+ years.</li>
            <li>MS SharePoint Administrator 5+ years.</li>
            <li>MS SharePoint development 2+ years.</li>
            <li>Proficient with HTML, CSS, JavaScript, and React.</li>
          </ul>
          <li><strong>Personnel Security Management 10+ years:</strong></li>
          <ul>
            <li>DoD Security Professional Education and Development (SPeD) Certifications:</li>
            <li>General Security Administration 21+ years.</li>
            <li>Command Security Manager 15+ years.</li>
            <li><a title="Center for Security Excellence SFPC certification webpage." href="https://www.cdse.edu/certification/sfpc.html">Security Professional Fundamentals (SFPC) 3+ years.</a></li>
            <li><a title="Center for Security Excellence PSC certification webpage." href="https://www.cdse.edu/certification/psc.html">Physical Security Certification (PSC) 3+ years.</a></li>
          </ul>
        <li><strong>Communications Security Manager (COMSEC) / Inspector 10+ years:</strong></li>
          <ul>
          <li>COMSEC(EKMS/KMI) Manager 5+ years.</li>
          <li>COMSEC(EKMS/KMI) Inspector 10+ years.</li>
          <li>Navy Communications Security Management System <a title="Navy COMSEC Management System webpage." href="https://www.navifor.usff.navy.mil/ncms/">(NCMS)</a> certified inspector since 2010.
          </li>
        </ul>
      </li>
      <li><strong>Bachelor's degree in Business Administration from Excelsior College. (2015).</strong></li>
      <li><strong>12 semester hours from completing an MBA with emphasis in technology management.</strong></li>
      <li><strong>Sigma Beta Delta National Honor Society for Business (2019).</strong></li>
      <ul>
      </ul>
    </ul>
    </div>
  <div>
    <p class="center-text"><em>For further details, check out my social media links at the bottom of this page.</em></p>
  </div>`
</script>

<SubContainerCommon className={name} {title} {body} />

<style>

</style>