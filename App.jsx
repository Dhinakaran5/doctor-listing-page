import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const API_URL = 'https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json';

const specialtiesList = [
  'General Physician', 'Dentist', 'Dermatologist', 'Paediatrician', 'Gynaecologist', 'ENT', 'Diabetologist',
  'Cardiologist', 'Physiotherapist', 'Endocrinologist', 'Orthopaedic', 'Ophthalmologist', 'Gastroenterologist',
  'Pulmonologist', 'Psychiatrist', 'Urologist', 'Dietitian/Nutritionist', 'Psychologist', 'Sexologist',
  'Nephrologist', 'Neurologist', 'Oncologist', 'Ayurveda', 'Homeopath'
];

const DoctorListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [consultation, setConsultation] = useState(searchParams.get('consultation') || '');
  const [specialties, setSpecialties] = useState(searchParams.getAll('specialties'));
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  useEffect(() => {
    axios.get(API_URL).then(res => setDoctors(res.data));
  }, []);

  useEffect(() => {
    const updated = applyFilters();
    setFilteredDoctors(updated);
  }, [doctors, search, consultation, specialties, sort]);

  const updateQueryParams = (key, value, isArray = false) => {
    const params = new URLSearchParams(searchParams);
    if (isArray) {
      params.delete(key);
      value.forEach(val => params.append(key, val));
    } else {
      value ? params.set(key, value) : params.delete(key);
    }
    setSearchParams(params);
  };

  const applyFilters = () => {
    let data = [...doctors];
    if (search) {
      data = data.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (consultation) {
      data = data.filter(doc => doc.consultation_type === consultation);
    }
    if (specialties.length > 0) {
      data = data.filter(doc => specialties.some(spec => doc.specialties.includes(spec)));
    }
    if (sort === 'fees') {
      data.sort((a, b) => a.fees - b.fees);
    } else if (sort === 'experience') {
      data.sort((a, b) => b.experience - a.experience);
    }
    return data;
  };

  const handleSearchChange = e => {
    const val = e.target.value;
    setSearch(val);
    updateQueryParams('search', val);
    if (val) {
      const matches = doctors.filter(d => d.name.toLowerCase().includes(val.toLowerCase())).slice(0, 3);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = name => {
    setSearch(name);
    updateQueryParams('search', name);
    setSuggestions([]);
  };

  const toggleSpecialty = value => {
    let updated = specialties.includes(value)
      ? specialties.filter(s => s !== value)
      : [...specialties, value];
    setSpecialties(updated);
    updateQueryParams('specialties', updated, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white text-gray-800 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <input
            type="text"
            data-testid="autocomplete-input"
            className="w-full border border-gray-300 rounded-xl p-3 shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
            placeholder="Search by doctor name"
            value={search}
            onChange={handleSearchChange}
          />
          {suggestions.length > 0 && (
            <div className="bg-white shadow-md rounded-md border mt-1">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  data-testid="suggestion-item"
                  className="p-2 cursor-pointer hover:bg-blue-100 rounded-md"
                  onClick={() => handleSuggestionClick(s.name)}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <h3 data-testid="filter-header-moc" className="font-semibold mb-2 text-lg">Consultation Type</h3>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="radio"
                    name="consultation"
                    value="Video Consult"
                    data-testid="filter-video-consult"
                    checked={consultation === 'Video Consult'}
                    onChange={(e) => {
                      setConsultation(e.target.value);
                      updateQueryParams('consultation', e.target.value);
                    }}
                  /> Video Consult
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="consultation"
                    value="In Clinic"
                    data-testid="filter-in-clinic"
                    checked={consultation === 'In Clinic'}
                    onChange={(e) => {
                      setConsultation(e.target.value);
                      updateQueryParams('consultation', e.target.value);
                    }}
                  /> In Clinic
                </label>
              </div>

              <h3 data-testid="filter-header-speciality" className="font-semibold mt-6 mb-2 text-lg">Specialties</h3>
              <div className="h-60 overflow-y-auto pr-2 custom-scrollbar">
                {specialtiesList.map(spec => (
                  <label key={spec} className="block">
                    <input
                      type="checkbox"
                      value={spec}
                      data-testid={`filter-specialty-${spec.replace(/\//g, '-').replace(/\s/g, '-')}`}
                      checked={specialties.includes(spec)}
                      onChange={() => toggleSpecialty(spec)}
                    /> {spec}
                  </label>
                ))}
              </div>

              <h3 data-testid="filter-header-sort" className="font-semibold mt-6 mb-2 text-lg">Sort By</h3>
              <div className="space-y-2">
                <label className="block">
                  <input
                    type="radio"
                    name="sort"
                    value="fees"
                    data-testid="sort-fees"
                    checked={sort === 'fees'}
                    onChange={(e) => {
                      setSort(e.target.value);
                      updateQueryParams('sort', e.target.value);
                    }}
                  /> Fees (Low to High)
                </label>
                <label className="block">
                  <input
                    type="radio"
                    name="sort"
                    value="experience"
                    data-testid="sort-experience"
                    checked={sort === 'experience'}
                    onChange={(e) => {
                      setSort(e.target.value);
                      updateQueryParams('sort', e.target.value);
                    }}
                  /> Experience (High to Low)
                </label>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            {filteredDoctors.length === 0 ? (
              <div className="text-center text-gray-600">No doctors found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDoctors.map((doc, idx) => (
                  <div
                    key={idx}
                    data-testid="doctor-card"
                    className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                  >
                    <div data-testid="doctor-name" className="text-xl font-bold text-blue-800">{doc.name}</div>
                    <div data-testid="doctor-specialty" className="text-sm text-gray-500">{doc.specialties.join(', ')}</div>
                    <div data-testid="doctor-experience" className="mt-2 text-gray-700">Experience: {doc.experience} years</div>
                    <div data-testid="doctor-fee" className="text-gray-700">Fee: ₹{doc.fees}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorListPage;
