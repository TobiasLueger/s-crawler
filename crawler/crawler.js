const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const fs = require('fs');

// Set to keep track of visited URLs to avoid processing the same URL multiple times
const visitedUrls = new Set();

// Dictionary to store results for each start URL
const results = {};

// Function to extract and return internal links from a webpage
const extractInternalLinks = (baseUrl, html) => {
  const $ = cheerio.load(html);
  const links = [];
  $('a').each((index, element) => {
    let href = $(element).attr('href');
    if (href) {
      let absoluteUrl = url.resolve(baseUrl, href);
      const parsedUrl = url.parse(absoluteUrl);
      // Remove query string
      absoluteUrl = url.format({
        protocol: parsedUrl.protocol,
        host: parsedUrl.host,
        pathname: parsedUrl.pathname,
      });
      // Check if the link is an internal link and does not end with .pdf
      if (absoluteUrl.startsWith(baseUrl) && !absoluteUrl.endsWith('.pdf')) {
        links.push(absoluteUrl);
      }
    }
  });
  return links;
};

// Function to extract create functions and their names from HTML content
const extractCreateFunctions = (html) => {
  const createFunctions = [];
  const createFunctionRegex = /([a-zA-Z0-9_]+)\.create\(\s*\{[^}]*\}\s*\)/g;
  let match;
  while ((match = createFunctionRegex.exec(html)) !== null) {
    createFunctions.push({ name: match[1], function: match[0] });
  }
  return createFunctions;
};

// Function to crawl a given URL
const crawl = async (baseUrl, currentUrl) => {
  if (visitedUrls.has(currentUrl)) {
    return;
  }
  visitedUrls.add(currentUrl);

  try {
    const response = await axios.get(currentUrl);
    const html = response.data;
    console.log(`Crawled: ${currentUrl}`);
    // Extract and log create functions
    const createFunctions = extractCreateFunctions(html);
    if (createFunctions.length > 0) {
      if (!results[baseUrl]) {
        results[baseUrl] = [];
      }
      createFunctions.forEach((func) => {
        if (!results[baseUrl].includes(func.name)) {
          results[baseUrl].push(func.name);
        }
      });
    }

    // Extract internal links and crawl them recursively
    const internalLinks = extractInternalLinks(baseUrl, html);
    for (const link of internalLinks) {
      await crawl(baseUrl, link);
    }
  } catch (error) {
    console.error(`Error crawling ${currentUrl}:`, error.message);
  }
};

// Array of starting URLs
const startUrls = [
  'https://www.sparkasse-aachen.de',
  'https://www.ksk-ostalb.de',
  'https://www.sparkasse-westmuensterland.de',
  'https://www.spk-aic-sob.de',
  'https://www.sparkasse-altenburgerland.de',
  'https://www.sparkasse-amberg-sulzbach.de',
  'https://www.erzgebirgssparkasse.de',
  'https://www.sparkasse-ansbach.de',
  'https://www.spk-as.de',
  'https://www.s-abmil.de',
  'https://www.sparkasse-alk.de',
  'https://www.sska.de',
  'https://www.sparkasse-aurich-norden.de',
  'https://www.sparkasse-wittgenstein.de',
  'https://www.sparkasse-rhein-haardt.de',
  'https://www.spk-hef.de',
  'https://www.taunussparkasse.de',
  'https://www.spk-kg.de',
  'https://www.sparkasse-rhein-nahe.de',
  'https://www.sk-westerwald-sieg.de',
  'https://www.kreissparkasse-ahrweiler.de',
  'https://www.sparkasse-badneustadt.de',
  'https://www.spkbopw.de',
  'https://www.sparkasse-holstein.de',
  'https://www.ssk-bad-pyrmont.de',
  'https://www.sparkasse-bgl.de',
  'https://www.spktw.de',
  'https://www.spk-bbg.de',
  'https://www.sparkasse-zollernalb.de',
  'https://www.sparkasse-bamberg.de',
  'https://www.stadtsparkasse-barsinghausen.de',
  'https://www.sparkasse-battenberg.de',
  'https://www.ksk-bautzen.de',
  'https://www.sparkasse-bayreuth.de',
  'https://www.sparkasse-beckum.de',
  'https://www.sparkasse-bensheim.de',
  'https://www.spk-bergkamen-boenen.de',
  'https://www.berliner-sparkasse.de',
  'https://www.sparkasse-emh.de',
  'https://www.ksk-bersenbrueck.de',
  'https://www.ksk-bc.de',
  'https://www.sparkasse-bielefeld.de',
  'https://www.kskbitburg-pruem.de',
  'https://www.ksk-anhalt-bitterfeld.de',
  'https://www.kskbb.de',
  'https://www.stadtsparkasse-bocholt.de',
  'https://www.sparkasse-bochum.de',
  'https://www.spk-bs.de',
  'https://www.bordesholmer-sparkasse.de',
  'https://www.spkbs.de',
  'https://www.sparkasse-bottrop.de',
  'https://www.blsk.de',
  'https://www.sparkasse-bremen.de',
  'https://www.wespa.de',
  'https://www.sparkasse-hochsauerland.de',
  'https://www.sparkasse-kraichgau.de',
  'https://www.spk-buehl.de',
  'https://www.sparkasse-burbach-neunkirchen.de',
  'https://www.stadtsparkasse-burgdorf.de',
  'https://www.spk-cham.de',
  'https://www.spk-chemnitz.de',
  'https://www.sparkasse-co-lif.de',
  'https://www.sparkasse-spree-neisse.de',
  'https://www.ssk-cuxhaven.de',
  'https://www.sparkasse-dachau.de',
  'https://www.sparkasse-darmstadt.de',
  'https://www.ksk-vulkaneifel.de',
  'https://www.sparkassedeggendorf.de',
  'https://www.sparkasse-dessau.de',
  'https://www.sparkasse-pdh.de',
  'https://www.sparkasse-dillenburg.de',
  'https://www.spk-dlg-noe.de',
  'https://www.sparkasse-doebeln.de',
  'https://www.sparkasse-donauwoerth.de',
  'https://www.sparkasse-dortmund.de',
  'https://www.ostsaechsische-sparkasse-dresden.de',
  'https://www.sparkasse-duderstadt.de',
  'https://www.sparkasse-duisburg.de',
  'https://www.sparkasse-dueren.de',
  'https://www.kreissparkasse-duesseldorf.de',
  'https://www.sskduesseldorf.de',
  'https://www.spk-barnim.de',
  'https://www.sparkasse-rottal-inn.de',
  'https://www.sparkasse-einbeck.de',
  'https://www.wartburg-sparkasse.de',
  'https://www.sparkasse-elmshorn.de',
  'https://www.sparkasse-emden.de',
  'https://www.sparkasse-engo.de',
  'https://www.sparkasse-odenwaldkreis.de',
  'https://www.spked.de',
  'https://www.sparkasse-mittelthueringen.de',
  'https://www.kreissparkasse-heinsberg.de',
  'https://www.sparkasse-erlangen.de',
  'https://www.sparkasse-werra-meissner.de',
  'https://www.sparkasse-essen.de',
  'https://www.ksk-es.de',
  'https://www.kreissparkasse-euskirchen.de',
  'https://www.spk-elbe-elster.de',
  'https://www.nospa.de',
  'https://www.sparkasse-forchheim.de',
  'https://www.frankfurter-sparkasse.de',
  'https://www.s-os.de',
  'https://www.sparkasse-mittelsachsen.de',
  'https://www.sparkasse-freiburg.de',
  'https://www.sparkasse-freising-moosburg.de',
  'https://www.ksk-fds.de',
  'https://www.spk-frg.de',
  'https://www.Sparkasse-Oberhessen.de',
  'https://www.sparkasse-bodensee.de',
  'https://www.sparkasse-fulda.de',
  'https://www.sparkasse-ffb.de',
  'https://www.sparkasse-fuerth.de',
  'https://www.ksk-gelnhausen.de',
  'https://www.sparkasse-gelsenkirchen.de',
  'https://www.sparkasse-gera-greiz.de',
  'https://www.sparkasse-geseke.de',
  'https://www.sparkasse-en.de',
  'https://www.sparkasse-giessen.de',
  'https://www.sparkasse-cgw.de',
  'https://www.sparkasse-gladbeck.de',
  'https://www.ksk-gp.de',
  'https://www.kreissparkasse-gotha.de',
  'https://www.spk-goettingen.de',
  'https://www.stadtsparkasse-grebenstein.de',
  'https://www.spk-vorpommern.de',
  'https://www.spk-muldental.de',
  'https://www.kskgg.de',
  'https://www.sparkasse-dieburg.de',
  'https://www.sparkasse-gruenberg.de',
  'https://www.sparkasse-gm.de',
  'https://www.sparkasse-gunzenhausen.de',
  'https://www.sparkasse-guetersloh-rietberg-versmold.de',
  'https://www.stadt-sparkasse-haan.de',
  'https://www.spkvr.de',
  'https://www.saalesparkasse.de',
  'https://www.haspa.de',
  'https://www.spkhb.de',
  'https://www.spkhw.de',
  'https://www.sparkasse-hamm.de',
  'https://www.sparkasse-hanau.de',
  'https://www.sparkasse-hannover.de',
  'https://www.sparkasse-kinzigtal.de',
  'https://www.sparkasse-hattingen.de',
  'https://www.sparkasse-heidelberg.de',
  'https://www.ksk-heidenheim.de',
  'https://www.sparkasse-heilbronn.de',
  'https://www.sms-hm.de',
  'https://www.sparkasse-starkenburg.de',
  'https://www.sparkasse-herford.de',
  'https://www.herner-sparkasse.de',
  'https://www.sparkasse-hildburghausen.de',
  'https://www.sparkasse-hgp.de',
  'https://www.ksk-saarpfalz.de',
  'https://www.ksk-steinfurt.de',
  'https://www.ksk-birkenfeld.de',
  'https://www.spkai.de',
  'https://www.spk-in-ei.de',
  'https://www.sparkasse-iserlohn.de',
  'https://www.sparkasse-westholstein.de',
  'https://www.s-jena.de',
  'https://www.sparkasse-kl.de',
  'https://www.sparkasse-karlsruhe.de',
  'https://www.kasseler-sparkasse.de',
  'https://www.sparkasse-kehl.de',
  'https://www.kreissparkasse-kelheim.de',
  'https://www.sparkasse-allgaeu.de',
  'https://www.foerde-sparkasse.de',
  'https://www.spkkm.de',
  'https://www.sparkasse-rhein-maas.de',
  'https://www.sparkasse-koblenz.de',
  'https://www.ksk-koeln.de',
  'https://www.sparkasse-koelnbonn.de',
  'https://www.sparkasse-wa-fkb.de',
  'https://www.sparkasse-krefeld.de',
  'https://www.s-kukc.de',
  'https://www.spk-hohenlohekreis.de',
  'https://www.ksk-kusel.de',
  'https://www.sparkasse-suedpfalz.de',
  'https://www.sparkasse-landsberg.de',
  'https://www.sparkasse-landshut.de',
  'https://www.sparkasse-langenfeld.de',
  'https://www.spk-laubach-hungen.de',
  'https://www.sparkasse-leerwittmund.de',
  'https://www.kreissparkasse-eichsfeld.de',
  'https://www.sparkasse-leipzig.de',
  'https://www.sparkasse-lemgo.de',
  'https://www.stadtsparkasse-lengerich.de',
  'https://www.sparkasse-lev.de',
  'https://www.ksk-limburg.de',
  'https://www.sparkasse-hellweg-lippe.de',
  'https://www.sparkasse-loerrach.de',
  'https://www.spk-luebeck.de',
  'https://www.ksklb.de',
  'https://www.sparkasse-vorderpfalz.de',
  'https://www.sparkasse-lueneburg.de',
  'https://www.sparkasse-adl.de',
  'https://www.sparkasse-msh.de',
  'https://www.sparkasse-wittenberg.de',
  'https://www.sparkasse-magdeburg.de',
  'https://www.rheinhessen-sparkasse.de',
  'https://www.sparkasse-rhein-neckar-nord.de',
  'https://www.skmb.de',
  'https://www.kskmayen.de',
  'https://www.rhoen-rennsteig-sparkasse.de',
  'https://www.ksk-melle.de',
  'https://www.Kreissparkasse-Schwalm-Eder.de',
  'https://www.spk-schwaben-bodensee.de',
  'https://www.sparkasse-emsland.de',
  'https://www.sparkassemerzig-wadern.de',
  'https://www.sparkasse-mitten-im-sauerland.de',
  'https://www.ksk-mbteg.de',
  'https://www.sparkasse-minden-luebbecke.de',
  'https://www.sparkasse-am-niederrhein.de',
  'https://www.ksk-ratzeburg.de',
  'https://www.sparkasse-moenchengladbach.de',
  'https://www.sparkasse-neckartal-odenwald.de',
  'https://www.spkam.de',
  'https://www.sparkasse-unstrut-hainich.de',
  'https://www.sparkasse-muelheim-ruhr.de',
  'https://www.sskm.de',
  'https://www.kskmse.de',
  'https://www.sparkasse-muensterland-ost.de',
  'https://www.spk-nbdm.de',
  'https://www.sparkasse-neuburg-rain.de',
  'https://www.sparkasse-neumarkt.de',
  'https://www.spk-suedholstein.de',
  'https://www.sparkasse-neunkirchen.de',
  'https://www.sparkasse-opr.de',
  'https://www.sparkasse-neuss.de',
  'https://www.sparkasse-nea.de',
  'https://www.vspk-neustadt.de',
  'https://www.spk-mecklenburg-strelitz.de',
  'https://www.spk-nu-ill.de',
  'https://www.sparkasse-neuwied.de',
  'https://www.sparkasse-nienburg.de',
  'https://www.kreissparkasse-nordhausen.de',
  'https://www.sparkasse-nordhorn.de',
  'https://www.ksn-northeim.de',
  'https://www.sparkasse-nuernberg.de',
  'https://www.stadtsparkasse-oberhausen.de',
  'https://www.sparkasse-offenbach.de',
  'https://www.sparkasse-offenburg.de',
  'https://www.lzo.com',
  'https://www.sparkasse-olpe.de',
  'https://www.ksk-boerde.de',
  'https://www.sparkasse-osnabrueck.de',
  'https://www.sparkasse-osterode.de',
  'https://www.sparkasse-uecker-randow.de',
  'https://www.sparkasse-passau.de',
  'https://www.sparkasse-pfaffenhofen.de',
  'https://www.skpfcw.de',
  'https://www.sparkasse-pm.de',
  'https://www.sparkasse-suedwestpfalz.de',
  'https://www.sparkasse-vogtland.de',
  'https://www.spk-mk.de',
  'https://www.mbs.de',
  'https://www.spk-uckermark.de',
  'https://www.sparkasse-prignitz.de',
  'https://www.stadtsparkasse-rahden.de',
  'https://www.spk-rastatt-gernsbach.de',
  'https://www.ksk-rv.de',
  'https://www.sparkasse-re.de',
  'https://www.sparkasse-regen-viechtach.de',
  'https://www.sparkasse-regensburg.de',
  'https://www.spk-reichenau.de',
  'https://www.stadtsparkasse-remscheid',
  'https://www.spk-mittelholstein.de',
  'https://www.ksk-reutlingen.de',
  'https://www.kskhwd.de',
  'https://www.sparkasse-rheine.de',
  'https://www.sparkasse-meissen.de',
  'https://www.spk-schaumburg.de',
  'https://www.sparkasse-donnersberg.de',
  'https://www.spk-ro-aib.de',
  'https://www.ospa.de',
  'https://www.sparkasse-mittelfranken-sued.de',
  'https://www.kskrw.de',
  'https://www.sparkasse-saalfeld-rudolstadt.de',
  'https://www.sparkasse-saarbruecken.de',
  'https://www.ksk-saarlouis.de',
  'https://www.spk-salem.de',
  'https://www.spaw.de',
  'https://www.sparkasse-st-blasien.de',
  'https://www.kskwnd.de',
  'https://www.spk-scheessel.de',
  'https://www.ksk-saale-orla.de',
  'https://www.ksk-schluechtern.de',
  'https://www.sparkasse-wiesental.de',
  'https://www.sparkasse-sha.de',
  'https://www.sparkasse-schwandorf.de',
  'https://www.sparkasse-schwedt.de',
  'https://www.sparkasse-sw-has.de',
  'https://www.spken.de',
  'https://www.spk-m-sn.de',
  'https://www.sparkasse-hochfranken.de',
  'https://www.sls-direkt.de',
  'https://www.sparkasse-niederlausitz.de',
  'https://www.sparkasse-siegen.de',
  'https://www.ksk-sigmaringen.de',
  'https://www.kskrh.de',
  'https://www.sparkasse-hegau-bodensee.de',
  'https://www.sparkasse-solingen.de',
  'https://www.ksk-soltau.de',
  'https://www.kyffhaeusersparkasse.de',
  'https://www.spkson.de',
  'https://www.ksk-stade.de',
  'https://www.sparkasse-stade-altes-land.de',
  'https://www.salzlandsparkasse.de',
  'https://www.sparkasse-staufen-breisach.de',
  'https://www.ksk-stendal.de',
  'https://www.sparkasse-niederbayern-mitte.de',
  'https://www.sparkasse-mol.de',
  'https://www.kreissparkasse-diepholz.de',
  'https://www.sparkasse-tauberfranken.de',
  'https://www.sparkasse-hochschwarzwald.de',
  'https://www.spk-ts.de',
  'https://www.sparkasse-trier.de',
  'https://www.ksk-tuebingen.de',
  'https://www.ksk-tut.de',
  'https://www.sparkasse-uelzen-luechow-dannenberg.de',
  'https://www.sparkasse-ulm.de',
  'https://www.sparkasse-unnakamen.de',
  'https://www.sparkasse-hrv.de',
  'https://www.ksk-verden.de',
  'https://www.spk-swb.de',
  'https://www.kskwn.de',
  'https://www.sparkasse-hochrhein.de',
  'https://www.ksk-walsrode.de',
  'https://www.mueritz-sparkasse.de',
  'https://www.sparkasse-wasserburg.de',
  'https://www.sparkasse-wedel.de',
  'https://www.sparkasse-oberpfalz-nord.de',
  'https://www.sparkasse-markgraeflerland.de',
  'https://www.ksk-weilburg.de',
  'https://www.sparkasse-oberland.de',
  'https://www.sparkasse-wermelskirchen.de',
  'https://www.harzsparkasse.de',
  'https://www.nispa.de',
  'https://www.Sparkasse-Wetzlar.de',
  'https://www.naspa.de',
  'https://www.sparkasse-wilhelmshaven.de',
  'https://www.spk-mecklenburg-nordwest.de',
  'https://www.sparkasse-witten.de',
  'https://www.sparkasse-wolfach.de',
  'https://www.ssk-wunstorf.de',
  'https://www.sparkasse-wuppertal.de',
  'https://www.sparkasse-mainfranken.de',
  'https://www.spk-burgenlandkreis.de',
  'https://www.spk-row-ohz.de',
  'https://www.sparkasse-oberlausitz-niederschlesien.de',
  'https://www.spk-zwickau.de',
];

// Start crawling all starting URLs
const startCrawling = async (urls) => {
  for (const startUrl of urls) {
    const startTime = new Date();
    await crawl(startUrl, startUrl);
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000; // Time in seconds
    console.log(`Time taken to crawl ${startUrl}: ${timeTaken} seconds`);
  }

  // Write results to a file
  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('Results written to results.json');
};

// Start the crawling process
startCrawling(startUrls);
